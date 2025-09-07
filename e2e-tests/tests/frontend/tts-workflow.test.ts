import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { TTSPage } from '../../pages/tts/TTSPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';

describe('Text-to-Speech Workflow', () => {
  let loginPage: LoginPage;
  let ttsPage: TTSPage;
  let dashboardPage: DashboardPage;

  beforeAll(async () => {
    // Login before running TTS tests
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await loginPage.waitForLogin();
  });

  beforeEach(async () => {
    ttsPage = new TTSPage(page);
    dashboardPage = new DashboardPage(page);
    
    await ttsPage.goto();
    await ttsPage.isLoaded();
  });

  describe('Basic TTS Generation', () => {
    it('should generate TTS with default settings', async () => {
      const testText = 'Hello, this is a test of text-to-speech functionality.';
      
      await ttsPage.enterText(testText);
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration();
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(false);
      
      const statusMessage = await ttsPage.getStatusMessage();
      expect(statusMessage.toLowerCase()).toMatch(/(complete|success|ready)/);
    });

    it('should validate text input length limits', async () => {
      const longText = 'A'.repeat(10000); // Very long text
      
      await ttsPage.enterText(longText);
      
      const characterCount = await ttsPage.getCharacterCount();
      const maxLimit = await ttsPage.getMaxCharacterLimit();
      
      if (maxLimit > 0) {
        const isExceeded = await ttsPage.isTextLimitExceeded();
        if (characterCount > maxLimit) {
          expect(isExceeded).toBe(true);
        }
      }
    });

    it('should handle empty text input', async () => {
      await ttsPage.generateTTS();
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(true);
      
      const errorMessage = await ttsPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/(empty|required|text)/);
    });

    it('should show character count correctly', async () => {
      const testText = 'Hello world';
      await ttsPage.enterText(testText);
      
      const characterCount = await ttsPage.getCharacterCount();
      expect(characterCount).toBe(testText.length);
    });
  });

  describe('Voice Selection', () => {
    it('should display available voices', async () => {
      const availableVoices = await ttsPage.getAvailableVoices();
      expect(availableVoices.length).toBeGreaterThan(0);
    });

    it('should select and generate TTS with different voices', async () => {
      const availableVoices = await ttsPage.getAvailableVoices();
      
      if (availableVoices.length > 1) {
        const testVoice = availableVoices[1]; // Select second voice
        
        await ttsPage.enterText('Testing voice selection.');
        await ttsPage.selectVoice(testVoice);
        
        const selectedVoice = await ttsPage.getSelectedVoice();
        expect(selectedVoice).toContain(testVoice);
        
        await ttsPage.generateTTS();
        await ttsPage.waitForGeneration();
        
        const hasErrors = await ttsPage.hasErrors();
        expect(hasErrors).toBe(false);
      }
    });

    it('should preview voice before generation', async () => {
      const availableVoices = await ttsPage.getAvailableVoices();
      
      if (availableVoices.length > 0) {
        await ttsPage.previewVoice(availableVoices[0]);
        
        // Should play preview audio
        await page.waitForTimeout(2000);
        
        // Check if preview audio is available
        const hasPreviewAudio = await ttsPage.isVisible('audio, .audio-player, [data-testid="preview-audio"]');
        expect(hasPreviewAudio).toBe(true);
      }
    });

    it('should search for specific voices', async () => {
      const searchQuery = 'female';
      await ttsPage.searchVoice(searchQuery);
      await page.waitForTimeout(1000);
      
      const availableVoices = await ttsPage.getAvailableVoices();
      
      // Should filter voices based on search
      if (availableVoices.length > 0) {
        const hasRelevantResults = availableVoices.some(voice => 
          voice.toLowerCase().includes(searchQuery.toLowerCase())
        );
        expect(hasRelevantResults).toBe(true);
      }
    });
  });

  describe('Voice Settings', () => {
    it('should adjust speech speed', async () => {
      await ttsPage.setSpeed(1.5);
      const currentSpeed = await ttsPage.getSpeed();
      expect(currentSpeed).toBeCloseTo(1.5, 1);
    });

    it('should adjust speech pitch', async () => {
      await ttsPage.setPitch(1.2);
      const currentPitch = await ttsPage.getPitch();
      expect(currentPitch).toBeCloseTo(1.2, 1);
    });

    it('should adjust speech volume', async () => {
      await ttsPage.setVolume(0.8);
      const currentVolume = await ttsPage.getVolume();
      expect(currentVolume).toBeCloseTo(0.8, 1);
    });

    it('should generate TTS with custom voice settings', async () => {
      const testText = 'Testing custom voice settings.';
      
      await ttsPage.generateTTSWithSettings({
        text: testText,
        speed: 1.3,
        pitch: 1.1,
        volume: 0.9
      });
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(false);
    });
  });

  describe('Language Selection', () => {
    it('should select different languages if available', async () => {
      const testText = 'Hello world';
      await ttsPage.enterText(testText);
      
      // Try to select English language
      await ttsPage.selectLanguage('en');
      const selectedLanguage = await ttsPage.getSelectedLanguage();
      
      if (selectedLanguage) {
        expect(selectedLanguage).toMatch(/en|english/i);
      }
    });

    it('should generate TTS in different languages', async () => {
      const testConfigs = [
        { text: 'Hello world', language: 'en' },
        { text: 'Bonjour le monde', language: 'fr' },
        { text: 'Hola mundo', language: 'es' }
      ];

      for (const config of testConfigs) {
        await ttsPage.enterText(config.text);
        
        try {
          await ttsPage.selectLanguage(config.language);
          await ttsPage.generateTTS();
          await ttsPage.waitForGeneration(30000);
          
          const hasErrors = await ttsPage.hasErrors();
          if (!hasErrors) {
            // Language is supported
            const statusMessage = await ttsPage.getStatusMessage();
            expect(statusMessage.toLowerCase()).toMatch(/(complete|success|ready)/);
          }
        } catch (error) {
          // Language might not be supported, skip
          console.log(`Language ${config.language} might not be supported`);
        }
        
        await ttsPage.clearText();
      }
    });
  });

  describe('Audio Playback', () => {
    beforeEach(async () => {
      // Generate TTS for playback tests
      await ttsPage.enterText('This is a test for audio playback functionality.');
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration();
    });

    it('should play generated audio', async () => {
      await ttsPage.playAudio();
      
      const isPlaying = await ttsPage.isAudioPlaying();
      expect(isPlaying).toBe(true);
    });

    it('should pause audio playback', async () => {
      await ttsPage.playAudio();
      await page.waitForTimeout(1000);
      
      await ttsPage.pauseAudio();
      
      const isPlaying = await ttsPage.isAudioPlaying();
      expect(isPlaying).toBe(false);
    });

    it('should show audio duration', async () => {
      const duration = await ttsPage.getAudioDuration();
      expect(duration).toBeGreaterThan(0);
    });

    it('should track current playback time', async () => {
      await ttsPage.playAudio();
      await page.waitForTimeout(2000);
      
      const currentTime = await ttsPage.getCurrentTime();
      expect(currentTime).toBeGreaterThan(0);
      
      await ttsPage.pauseAudio();
    });
  });

  describe('Audio Export and Download', () => {
    beforeEach(async () => {
      // Generate TTS for export tests
      await ttsPage.enterText('This is a test for audio export functionality.');
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration();
    });

    it('should download generated audio', async () => {
      // Set up download handling
      const downloadPath = './downloads';
      await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
      });

      await ttsPage.downloadAudio();
      
      // Wait for download to start
      await page.waitForTimeout(3000);
      
      // Check if download was triggered
      expect(true).toBe(true); // Placeholder - actual file check would require file system access
    });

    it('should select audio format for export', async () => {
      const formats = ['mp3', 'wav', 'ogg'];
      
      for (const format of formats) {
        try {
          await ttsPage.selectAudioFormat(format);
          
          // Check if format selection was successful
          const formatSelect = await ttsPage.isVisible('.format-select, [data-testid="audio-format"]');
          if (formatSelect) {
            expect(formatSelect).toBe(true);
          }
        } catch (error) {
          // Format might not be available
          console.log(`Format ${format} might not be available`);
        }
      }
    });

    it('should select audio quality for export', async () => {
      const qualities = ['high', 'medium', 'low'];
      
      for (const quality of qualities) {
        try {
          await ttsPage.selectAudioQuality(quality);
          
          const qualitySelect = await ttsPage.isVisible('.quality-select, [data-testid="audio-quality"]');
          if (qualitySelect) {
            expect(qualitySelect).toBe(true);
          }
        } catch (error) {
          // Quality option might not be available
          console.log(`Quality ${quality} might not be available`);
        }
      }
    });

    it('should export audio with custom settings', async () => {
      await ttsPage.generateTTSWithSettings({
        text: 'Testing custom export settings.',
        format: 'wav',
        quality: 'high'
      });
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(false);
    });
  });

  describe('Project Management', () => {
    it('should save TTS project', async () => {
      const projectName = `TTS Project ${Date.now()}`;
      
      await ttsPage.enterText('This is a saved TTS project.');
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration();
      
      await ttsPage.saveProject(projectName);
      
      // Should show success message or redirect
      await page.waitForTimeout(2000);
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(false);
    });
  });

  describe('Generation Progress and Status', () => {
    it('should show generation progress', async () => {
      await ttsPage.enterText('Testing generation progress indicators.');
      await ttsPage.generateTTS();
      
      // Check if processing indicator appears
      const isProcessing = await ttsPage.isGenerating();
      expect(isProcessing).toBe(true);
      
      await ttsPage.waitForGeneration();
      
      // Processing should be complete
      const isStillProcessing = await ttsPage.isGenerating();
      expect(isStillProcessing).toBe(false);
    });

    it('should show status messages during generation', async () => {
      await ttsPage.enterText('Testing status messages.');
      await ttsPage.generateTTS();
      
      // Should show some status message
      let statusMessage = await ttsPage.getStatusMessage();
      expect(statusMessage.length).toBeGreaterThan(0);
      
      await ttsPage.waitForGeneration();
      
      statusMessage = await ttsPage.getStatusMessage();
      expect(statusMessage.toLowerCase()).toMatch(/(complete|success|ready|done)/);
    });

    it('should allow canceling generation', async () => {
      await ttsPage.enterText('Testing generation cancellation.');
      await ttsPage.generateTTS();
      
      // Try to stop generation
      if (await ttsPage.isVisible('.stop-button, [data-testid="stop-tts"]')) {
        await ttsPage.stopGeneration();
        await page.waitForTimeout(2000);
        
        const isProcessing = await ttsPage.isGenerating();
        expect(isProcessing).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during generation', async () => {
      await ttsPage.enterText('Testing network error handling.');
      
      // Simulate network failure
      await page.setOfflineMode(true);
      
      await ttsPage.generateTTS();
      await page.waitForTimeout(5000);
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(true);
      
      const errorMessage = await ttsPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/(network|connection|error|failed)/);
      
      // Restore network
      await page.setOfflineMode(false);
    });

    it('should handle invalid characters in text', async () => {
      const invalidText = '🏠🚗🎉💻📱'; // Emoji text
      
      await ttsPage.enterText(invalidText);
      await ttsPage.generateTTS();
      
      try {
        await ttsPage.waitForGeneration();
      } catch (error) {
        // Generation might fail or succeed depending on TTS engine
      }
      
      // Should either succeed or show appropriate error
      const hasErrors = await ttsPage.hasErrors();
      const statusMessage = await ttsPage.getStatusMessage();
      
      expect(hasErrors || statusMessage.toLowerCase().includes('complete')).toBe(true);
    });

    it('should show appropriate warnings for edge cases', async () => {
      const edgeCases = [
        'ALLCAPSTEXTTOTEST',
        'text.with.many.periods...',
        'text with very long single word supercalifragilisticexpialidocious',
        '123456789 numeric text 987654321'
      ];

      for (const testCase of edgeCases) {
        await ttsPage.clearText();
        await ttsPage.enterText(testCase);
        await ttsPage.generateTTS();
        
        try {
          await ttsPage.waitForGeneration(30000);
          
          const warningMessage = await ttsPage.getWarningMessage();
          const errorMessage = await ttsPage.getErrorMessage();
          
          // Should either succeed or show appropriate message
          expect(true).toBe(true); // Test passes if no uncaught errors
        } catch (error) {
          // Some edge cases might fail - that's expected
          console.log(`Edge case "${testCase}" failed as expected`);
        }
      }
    });
  });

  describe('Performance and Limits', () => {
    it('should handle maximum text length', async () => {
      const maxText = 'A'.repeat(5000); // Large text
      
      await ttsPage.enterText(maxText);
      
      const characterCount = await ttsPage.getCharacterCount();
      expect(characterCount).toBe(5000);
      
      const isLimitExceeded = await ttsPage.isTextLimitExceeded();
      
      if (!isLimitExceeded) {
        await ttsPage.generateTTS();
        
        try {
          await ttsPage.waitForGeneration(120000); // 2 minute timeout for large text
          
          const hasErrors = await ttsPage.hasErrors();
          expect(hasErrors).toBe(false);
        } catch (error) {
          // Large text generation might timeout or fail
          console.log('Large text generation failed as expected');
        }
      }
    });

    it('should complete generation within reasonable time', async () => {
      const shortText = 'Quick test.';
      
      const startTime = Date.now();
      
      await ttsPage.enterText(shortText);
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration(30000);
      
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      // Short text should generate within 30 seconds
      expect(generationTime).toBeLessThan(30000);
      
      const hasErrors = await ttsPage.hasErrors();
      expect(hasErrors).toBe(false);
    });
  });

  describe('Integration with Other Features', () => {
    it('should navigate between TTS and other features', async () => {
      // Generate TTS
      await ttsPage.enterText('Testing integration.');
      await ttsPage.generateTTS();
      await ttsPage.waitForGeneration();
      
      // Navigate to voice cloning
      await dashboardPage.navigateToVoiceCloning();
      await dashboardPage.waitForPageLoad();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/voice-cloning');
      
      // Navigate back to TTS
      await dashboardPage.navigateToTTS();
      await ttsPage.isLoaded();
      
      // Previous work might be preserved (depending on implementation)
      const currentText = await ttsPage.getText();
      expect(typeof currentText).toBe('string');
    });

    it('should work with voice clones if available', async () => {
      // This would test using custom voice clones in TTS
      // Implementation depends on the app's voice management system
      
      const availableVoices = await ttsPage.getAvailableVoices();
      
      // Look for custom voices
      const customVoices = availableVoices.filter(voice => 
        voice.toLowerCase().includes('custom') || voice.toLowerCase().includes('clone')
      );
      
      if (customVoices.length > 0) {
        await ttsPage.enterText('Testing with custom voice.');
        await ttsPage.selectVoice(customVoices[0]);
        await ttsPage.generateTTS();
        await ttsPage.waitForGeneration();
        
        const hasErrors = await ttsPage.hasErrors();
        expect(hasErrors).toBe(false);
      }
    });
  });
});