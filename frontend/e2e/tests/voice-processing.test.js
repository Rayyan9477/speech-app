/**
 * Voice Processing E2E Tests
 * Tests audio upload, processing, and voice generation workflows
 */

describe('Voice Processing Workflows', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await testUtils.login(page);
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Text-to-Speech Generation', () => {
    test('should create TTS project successfully', async () => {
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      // Fill TTS form
      await page.fill('input[name="projectName"]', 'Test TTS Project');
      await page.fill('textarea[name="text"]', 'This is a test text for speech generation.');
      
      // Select voice
      await page.click('[data-testid="voice-selector"]');
      await page.click('[data-testid="voice-option-1"]');
      
      // Set voice parameters
      await page.fill('input[name="speed"]', '1.0');
      await page.fill('input[name="pitch"]', '0.0');
      
      // Generate speech
      await page.click('[data-testid="generate-button"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 30000 });
      
      // Verify audio player appears
      await page.waitForSelector('[data-testid="audio-player"]');
      
      await testUtils.takeScreenshot(page, 'tts-generation-complete');
    });

    test('should validate text input requirements', async () => {
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      // Try to generate without text
      await page.click('[data-testid="generate-button"]');
      
      // Should show validation error
      await page.waitForSelector('[data-testid="text-required-error"]');
    });

    test('should handle long text processing', async () => {
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      // Long text (1000+ characters)
      const longText = 'Lorem ipsum '.repeat(100);
      await page.fill('textarea[name="text"]', longText);
      
      await page.click('[data-testid="generate-button"]');
      
      // Should show progress indicator
      await page.waitForSelector('[data-testid="processing-progress"]');
      
      // Should complete eventually
      await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 60000 });
    });
  });

  describe('Voice Cloning Workflow', () => {
    test('should upload and process voice sample', async () => {
      await page.goto('http://localhost:3000/dashboard/voice-cloning');
      
      // Start voice cloning process
      await page.click('[data-testid="create-voice-clone"]');
      
      // Upload audio file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/sample-voice.wav');
      
      // Fill voice details
      await page.fill('input[name="voiceName"]', 'Test Voice Clone');
      await page.fill('textarea[name="description"]', 'A test voice clone for E2E testing');
      
      // Start processing
      await page.click('[data-testid="start-cloning"]');
      
      // Wait for processing to complete
      await page.waitForSelector('[data-testid="cloning-complete"]', { timeout: 120000 });
      
      // Verify voice appears in library
      await page.waitForSelector('[data-testid="voice-clone-card"]');
      
      await testUtils.takeScreenshot(page, 'voice-cloning-complete');
    });

    test('should validate audio file format', async () => {
      await page.goto('http://localhost:3000/dashboard/voice-cloning');
      
      await page.click('[data-testid="create-voice-clone"]');
      
      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/invalid-file.txt');
      
      // Should show format error
      await page.waitForSelector('[data-testid="invalid-format-error"]');
    });

    test('should handle audio file size limits', async () => {
      await page.goto('http://localhost:3000/dashboard/voice-cloning');
      
      await page.click('[data-testid="create-voice-clone"]');
      
      // Try to upload large file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/large-audio.wav');
      
      // Should show size error
      await page.waitForSelector('[data-testid="file-too-large-error"]');
    });
  });

  describe('Voice Translation', () => {
    test('should translate voice to different language', async () => {
      await page.goto('http://localhost:3000/dashboard/voice-translate');
      
      // Upload source audio
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/english-audio.wav');
      
      // Select target language
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-spanish"]');
      
      // Select target voice
      await page.click('[data-testid="target-voice-selector"]');
      await page.click('[data-testid="spanish-voice-1"]');
      
      // Start translation
      await page.click('[data-testid="start-translation"]');
      
      // Wait for processing steps
      await page.waitForSelector('[data-testid="transcription-complete"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="translation-complete"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="synthesis-complete"]', { timeout: 60000 });
      
      // Verify result audio player
      await page.waitForSelector('[data-testid="result-audio-player"]');
      
      await testUtils.takeScreenshot(page, 'voice-translation-complete');
    });

    test('should show translation progress steps', async () => {
      await page.goto('http://localhost:3000/dashboard/voice-translate');
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('e2e/fixtures/english-audio.wav');
      
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-french"]');
      
      await page.click('[data-testid="start-translation"]');
      
      // Verify progress indicators appear
      await page.waitForSelector('[data-testid="step-transcription"]');
      await page.waitForSelector('[data-testid="step-translation"]');
      await page.waitForSelector('[data-testid="step-synthesis"]');
      
      // Check progress updates
      const transcriptionProgress = page.locator('[data-testid="transcription-progress"]');
      await expect(transcriptionProgress).toBeVisible();
    });
  });

  describe('Audio Playback and Controls', () => {
    test('should control audio playback', async () => {
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      // Generate sample TTS
      await page.fill('input[name="projectName"]', 'Playback Test');
      await page.fill('textarea[name="text"]', 'Testing audio playback controls.');
      await page.click('[data-testid="generate-button"]');
      
      await page.waitForSelector('[data-testid="audio-player"]');
      
      // Test play button
      await page.click('[data-testid="play-button"]');
      await page.waitForTimeout(2000);
      
      // Test pause button
      await page.click('[data-testid="pause-button"]');
      
      // Test volume control
      const volumeSlider = page.locator('[data-testid="volume-slider"]');
      await volumeSlider.click({ position: { x: 50, y: 0 } });
      
      // Test progress bar seeking
      const progressBar = page.locator('[data-testid="progress-bar"]');
      await progressBar.click({ position: { x: 100, y: 0 } });
      
      await testUtils.takeScreenshot(page, 'audio-controls-interaction');
    });

    test('should download generated audio', async () => {
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      await page.fill('input[name="projectName"]', 'Download Test');
      await page.fill('textarea[name="text"]', 'Testing audio download functionality.');
      await page.click('[data-testid="generate-button"]');
      
      await page.waitForSelector('[data-testid="audio-player"]');
      
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click download button
      await page.click('[data-testid="download-button"]');
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.wav$|\.mp3$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API failure
      await page.route('**/api/tts/generate', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });
      
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      await page.fill('textarea[name="text"]', 'This will fail');
      await page.click('[data-testid="generate-button"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="generation-error"]');
      
      const errorText = await page.textContent('[data-testid="generation-error"]');
      expect(errorText).toContain('generation failed');
    });

    test('should handle network timeout', async () => {
      // Mock slow response
      await page.route('**/api/tts/generate', route => {
        // Never respond to simulate timeout
        // Route will timeout based on test configuration
      });
      
      await page.goto('http://localhost:3000/dashboard/tts/create');
      
      await page.fill('textarea[name="text"]', 'This will timeout');
      await page.click('[data-testid="generate-button"]');
      
      // Should show timeout error
      await page.waitForSelector('[data-testid="timeout-error"]', { timeout: 35000 });
    });
  });
});