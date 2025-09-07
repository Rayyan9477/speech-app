/**
 * End-to-End tests for critical user workflows
 * Tests complete user journeys from registration to voice processing
 */

import { test, expect, Page, Browser } from '@playwright/test'
import { createMockAudioFile } from '../../test/utils'

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:8000'

class WorkflowHelper {
  constructor(private page: Page) {}

  async registerUser(userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  }) {
    await this.page.goto(`${BASE_URL}/auth/register`)
    
    await this.page.fill('[data-testid="username-input"]', userData.username)
    await this.page.fill('[data-testid="email-input"]', userData.email)
    await this.page.fill('[data-testid="password-input"]', userData.password)
    await this.page.fill('[data-testid="first-name-input"]', userData.firstName)
    await this.page.fill('[data-testid="last-name-input"]', userData.lastName)
    
    await this.page.click('[data-testid="register-button"]')
    
    // Wait for registration success or error
    await this.page.waitForSelector('[data-testid="registration-result"]', { timeout: 10000 })
    
    return userData
  }

  async loginUser(credentials: { username: string; password: string }) {
    await this.page.goto(`${BASE_URL}/auth/login`)
    
    await this.page.fill('[data-testid="username-input"]', credentials.username)
    await this.page.fill('[data-testid="password-input"]', credentials.password)
    
    await this.page.click('[data-testid="login-button"]')
    
    // Wait for login to complete
    await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 })
  }

  async uploadAudioFile(filePath: string, fileName = 'test-audio.wav') {
    // Navigate to upload area
    await this.page.click('[data-testid="upload-audio-button"]')
    
    // Upload file
    const fileInput = this.page.locator('[data-testid="audio-file-input"]')
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'audio/wav',
      buffer: Buffer.from('fake audio content')
    })
    
    // Wait for upload to complete
    await this.page.waitForSelector('[data-testid="upload-success"]', { timeout: 30000 })
  }

  async selectVoice(voiceId: string) {
    await this.page.click(`[data-testid="voice-option-${voiceId}"]`)
    await this.page.waitForSelector(`[data-testid="voice-selected-${voiceId}"]`)
  }

  async waitForProcessingComplete() {
    // Wait for processing to start
    await this.page.waitForSelector('[data-testid="processing-indicator"]', { timeout: 5000 })
    
    // Wait for processing to complete
    await this.page.waitForSelector('[data-testid="processing-complete"]', { timeout: 60000 })
  }

  async verifyAudioPlayback() {
    const audioPlayer = this.page.locator('[data-testid="result-audio-player"]')
    await expect(audioPlayer).toBeVisible()
    
    const playButton = this.page.locator('[data-testid="audio-play-button"]')
    await playButton.click()
    
    // Verify audio is playing
    await expect(this.page.locator('[data-testid="audio-playing-indicator"]')).toBeVisible()
  }
}

test.describe('Complete User Workflows', () => {
  let helper: WorkflowHelper

  test.beforeEach(async ({ page }) => {
    helper = new WorkflowHelper(page)
  })

  test('Complete user registration and login flow', async ({ page }) => {
    // Register new user
    const userData = await helper.registerUser()
    
    // Verify registration success
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="registration-success"]')).toContainText('Registration successful')
    
    // Login with registered user
    await helper.loginUser({
      username: userData.username,
      password: userData.password
    })
    
    // Verify successful login
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="user-name"]')).toContainText(userData.firstName)
  })

  test('Complete text-to-speech workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Navigate to TTS
    await page.click('[data-testid="nav-tts"]')
    await expect(page.locator('[data-testid="tts-page"]')).toBeVisible()
    
    // Enter text
    const testText = 'This is a test of the text to speech functionality.'
    await page.fill('[data-testid="tts-text-input"]', testText)
    
    // Select voice
    await page.click('[data-testid="voice-selector"]')
    await page.click('[data-testid="voice-option-emma"]')
    
    // Adjust settings
    await page.click('[data-testid="settings-panel"]')
    await page.fill('[data-testid="speed-slider"]', '1.2')
    await page.fill('[data-testid="pitch-slider"]', '1.0')
    
    // Generate speech
    await page.click('[data-testid="generate-speech-button"]')
    
    // Wait for generation to complete
    await helper.waitForProcessingComplete()
    
    // Verify result
    await expect(page.locator('[data-testid="generation-result"]')).toBeVisible()
    await helper.verifyAudioPlayback()
    
    // Test download functionality
    await page.click('[data-testid="download-button"]')
    
    // Verify download started (this might vary based on browser)
    // In a real scenario, you might check for download events
  })

  test('Complete voice cloning workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Navigate to voice cloning
    await page.click('[data-testid="nav-voice-cloning"]')
    await expect(page.locator('[data-testid="voice-cloning-page"]')).toBeVisible()
    
    // Upload training audio
    await helper.uploadAudioFile('sample1.wav')
    await helper.uploadAudioFile('sample2.wav')
    await helper.uploadAudioFile('sample3.wav')
    
    // Verify minimum samples uploaded
    await expect(page.locator('[data-testid="sample-count"]')).toContainText('3')
    
    // Enter voice details
    await page.fill('[data-testid="voice-name-input"]', 'My Custom Voice')
    await page.fill('[data-testid="voice-description-input"]', 'A test voice for e2e testing')
    
    // Start training
    await page.click('[data-testid="start-training-button"]')
    
    // Verify training started
    await expect(page.locator('[data-testid="training-status"]')).toContainText('Training in progress')
    
    // In a real scenario, training would take time
    // For testing, we might mock this or use a faster training model
    
    // Navigate to voice library to check created voice
    await page.click('[data-testid="nav-voice-library"]')
    await expect(page.locator('[data-testid="custom-voice-My-Custom-Voice"]')).toBeVisible()
  })

  test('Complete voice translation workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Navigate to voice translation
    await page.click('[data-testid="nav-voice-translate"]')
    await expect(page.locator('[data-testid="voice-translate-page"]')).toBeVisible()
    
    // Upload source audio
    await helper.uploadAudioFile('english-speech.wav')
    
    // Select source language
    await page.click('[data-testid="source-language-selector"]')
    await page.click('[data-testid="language-option-en-US"]')
    
    // Select target language
    await page.click('[data-testid="target-language-selector"]')
    await page.click('[data-testid="language-option-es-ES"]')
    
    // Select target voice
    await page.click('[data-testid="target-voice-selector"]')
    await page.click('[data-testid="voice-option-sofia"]')
    
    // Start translation
    await page.click('[data-testid="start-translation-button"]')
    
    // Wait for translation to complete
    await helper.waitForProcessingComplete()
    
    // Verify results
    await expect(page.locator('[data-testid="original-text"]')).toBeVisible()
    await expect(page.locator('[data-testid="translated-text"]')).toBeVisible()
    await expect(page.locator('[data-testid="translated-audio"]')).toBeVisible()
    
    // Test playback of both original and translated audio
    await page.click('[data-testid="play-original-button"]')
    await expect(page.locator('[data-testid="original-audio-playing"]')).toBeVisible()
    
    await page.click('[data-testid="play-translated-button"]')
    await expect(page.locator('[data-testid="translated-audio-playing"]')).toBeVisible()
  })

  test('Complete project management workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Create a new TTS project
    await page.click('[data-testid="nav-tts"]')
    await page.fill('[data-testid="tts-text-input"]', 'This is my first project.')
    await page.click('[data-testid="voice-option-emma"]')
    
    // Save as project
    await page.click('[data-testid="save-project-button"]')
    await page.fill('[data-testid="project-name-input"]', 'My First Project')
    await page.click('[data-testid="confirm-save-button"]')
    
    // Verify project saved
    await expect(page.locator('[data-testid="project-saved-success"]')).toBeVisible()
    
    // Navigate to projects page
    await page.click('[data-testid="nav-projects"]')
    await expect(page.locator('[data-testid="project-My-First-Project"]')).toBeVisible()
    
    // Edit project
    await page.click('[data-testid="edit-project-My-First-Project"]')
    await page.fill('[data-testid="tts-text-input"]', 'This is my updated project text.')
    await page.click('[data-testid="save-changes-button"]')
    
    // Verify changes saved
    await expect(page.locator('[data-testid="changes-saved-success"]')).toBeVisible()
    
    // Delete project
    await page.click('[data-testid="nav-projects"]')
    await page.click('[data-testid="delete-project-My-First-Project"]')
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Verify project deleted
    await expect(page.locator('[data-testid="project-My-First-Project"]')).not.toBeVisible()
  })

  test('Complete user profile and settings workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Navigate to profile settings
    await page.click('[data-testid="user-profile-menu"]')
    await page.click('[data-testid="profile-settings-link"]')
    
    // Update profile information
    await page.fill('[data-testid="first-name-input"]', 'UpdatedFirst')
    await page.fill('[data-testid="last-name-input"]', 'UpdatedLast')
    await page.fill('[data-testid="email-input"]', 'updated@example.com')
    
    await page.click('[data-testid="save-profile-button"]')
    await expect(page.locator('[data-testid="profile-updated-success"]')).toBeVisible()
    
    // Update application settings
    await page.click('[data-testid="app-settings-tab"]')
    
    // Change theme
    await page.click('[data-testid="theme-selector"]')
    await page.click('[data-testid="theme-option-dark"]')
    
    // Verify dark theme applied
    await expect(page.locator('body')).toHaveClass(/dark-theme/)
    
    // Change language
    await page.click('[data-testid="language-selector"]')
    await page.click('[data-testid="language-option-es"]')
    
    // Verify language changed (UI should show Spanish text)
    await expect(page.locator('[data-testid="settings-title"]')).toContainText('Configuración')
    
    // Update notification preferences
    await page.click('[data-testid="notifications-tab"]')
    await page.click('[data-testid="email-notifications-toggle"]')
    await page.click('[data-testid="browser-notifications-toggle"]')
    
    await page.click('[data-testid="save-settings-button"]')
    await expect(page.locator('[data-testid="settings-updated-success"]')).toBeVisible()
  })

  test('Complete password change workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Navigate to security settings
    await page.click('[data-testid="user-profile-menu"]')
    await page.click('[data-testid="security-settings-link"]')
    
    // Change password
    await page.fill('[data-testid="current-password-input"]', userData.password)
    await page.fill('[data-testid="new-password-input"]', 'NewPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
    
    await page.click('[data-testid="change-password-button"]')
    
    // Should be redirected to login after password change
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-changed-message"]')).toBeVisible()
    
    // Login with new password
    await helper.loginUser({
      username: userData.username,
      password: 'NewPassword123!'
    })
    
    // Verify successful login with new password
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
  })

  test('Error handling and recovery workflow', async ({ page }) => {
    // Test registration with duplicate email
    const userData = await helper.registerUser()
    
    // Try to register again with same email
    await page.goto(`${BASE_URL}/auth/register`)
    await page.fill('[data-testid="username-input"]', 'different_user')
    await page.fill('[data-testid="email-input"]', userData.email)
    await page.fill('[data-testid="password-input"]', userData.password)
    await page.fill('[data-testid="first-name-input"]', 'Different')
    await page.fill('[data-testid="last-name-input"]', 'User')
    
    await page.click('[data-testid="register-button"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="registration-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="registration-error"]')).toContainText('Email already exists')
    
    // Test login with wrong credentials
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('[data-testid="username-input"]', userData.username)
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!')
    
    await page.click('[data-testid="login-button"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid')
    
    // Test network error handling (mock offline)
    await page.context().setOffline(true)
    
    await page.fill('[data-testid="username-input"]', userData.username)
    await page.fill('[data-testid="password-input"]', userData.password)
    await page.click('[data-testid="login-button"]')
    
    // Verify offline error message
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
    
    // Restore network and retry
    await page.context().setOffline(false)
    await page.click('[data-testid="retry-button"]')
    
    // Should succeed now
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
  })

  test('Mobile responsive workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible()
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-nav-toggle"]')
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible()
    
    // Navigate using mobile menu
    await page.click('[data-testid="mobile-nav-tts"]')
    await expect(page.locator('[data-testid="tts-page"]')).toBeVisible()
    
    // Test touch interactions
    const textInput = page.locator('[data-testid="tts-text-input"]')
    await textInput.tap()
    await textInput.fill('Mobile test text')
    
    // Test swipe gestures (if implemented)
    // await page.mouse.move(100, 300)
    // await page.mouse.down()
    // await page.mouse.move(300, 300)
    // await page.mouse.up()
    
    // Verify mobile-optimized UI elements
    await expect(page.locator('[data-testid="mobile-voice-selector"]')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible()
  })

  test('Accessibility workflow', async ({ page }) => {
    // Setup: Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="nav-tts"]')).toBeFocused()
    
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="tts-page"]')).toBeVisible()
    
    // Test screen reader support
    const textInput = page.locator('[data-testid="tts-text-input"]')
    await expect(textInput).toHaveAttribute('aria-label')
    await expect(textInput).toHaveAttribute('role')
    
    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('body')).toHaveCSS('background-color', /rgb\(0, 0, 0\)|rgb\(18, 18, 18\)/)
    
    // Test focus management
    await page.click('[data-testid="voice-selector"]')
    await expect(page.locator('[data-testid="voice-dropdown"]')).toBeFocused()
    
    // Test ARIA announcements
    await page.click('[data-testid="generate-speech-button"]')
    await expect(page.locator('[aria-live="polite"]')).toContainText('Generation started')
  })

  test('Performance workflow', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now()
    
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
    
    // Register and login
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Measure TTS generation time
    await page.click('[data-testid="nav-tts"]')
    await page.fill('[data-testid="tts-text-input"]', 'Performance test text')
    await page.click('[data-testid="voice-option-emma"]')
    
    const generationStart = Date.now()
    await page.click('[data-testid="generate-speech-button"]')
    await helper.waitForProcessingComplete()
    
    const generationTime = Date.now() - generationStart
    expect(generationTime).toBeLessThan(30000) // Should complete within 30 seconds
    
    // Test large file handling
    const largeText = 'This is a long text. '.repeat(1000) // ~20,000 characters
    await page.fill('[data-testid="tts-text-input"]', largeText)
    
    const largeTextStart = Date.now()
    await page.click('[data-testid="generate-speech-button"]')
    
    // Should either succeed or show appropriate error for text too long
    try {
      await helper.waitForProcessingComplete()
      const largeTextTime = Date.now() - largeTextStart
      expect(largeTextTime).toBeLessThan(60000) // Should complete within 60 seconds
    } catch {
      // Check for appropriate error message
      await expect(page.locator('[data-testid="text-too-long-error"]')).toBeVisible()
    }
  })

  test('Cross-browser compatibility', async ({ browserName, page }) => {
    // Test basic functionality across different browsers
    const userData = await helper.registerUser()
    await helper.loginUser(userData)
    
    // Test audio playback (varies by browser)
    await page.click('[data-testid="nav-tts"]')
    await page.fill('[data-testid="tts-text-input"]', 'Cross-browser test')
    await page.click('[data-testid="voice-option-emma"]')
    await page.click('[data-testid="generate-speech-button"]')
    
    await helper.waitForProcessingComplete()
    
    // Audio playback might work differently in different browsers
    const audioPlayer = page.locator('[data-testid="result-audio-player"]')
    await expect(audioPlayer).toBeVisible()
    
    if (browserName === 'chromium' || browserName === 'webkit') {
      // Test WebRTC features (if used for real-time processing)
      const mediaDevices = await page.evaluate(() => 
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => true)
          .catch(() => false)
      )
      
      // Note: This requires user permission in real scenarios
      // For testing, we might mock this
    }
    
    // Test file download (varies by browser)
    await page.click('[data-testid="download-button"]')
    
    // In headless mode, downloads might not work the same way
    // We can test that the download link is generated correctly
    const downloadLink = page.locator('[data-testid="download-link"]')
    await expect(downloadLink).toHaveAttribute('href')
    await expect(downloadLink).toHaveAttribute('download')
  })
})