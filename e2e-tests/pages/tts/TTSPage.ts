import { Page } from 'puppeteer';
import { BasePage } from '../BasePage';

export class TTSPage extends BasePage {
  private selectors = {
    // Text input
    textInput: 'textarea[name="text"], #text-input, .text-input, [data-testid="text-input"]',
    textCounter: '.text-counter, .character-count, [data-testid="character-count"]',
    
    // Voice selection
    voiceSelect: 'select[name="voice"], #voice-select, .voice-select, [data-testid="voice-select"]',
    voicePreviewButton: '.voice-preview, [data-testid="voice-preview"]',
    voiceSearchInput: '.voice-search, [data-testid="voice-search"]',
    voiceList: '.voice-list, [data-testid="voice-list"]',
    voiceCard: '.voice-card, [data-testid="voice-card"]',
    selectedVoice: '.selected-voice, [data-testid="selected-voice"]',
    
    // Voice settings
    speedSlider: 'input[name="speed"], .speed-slider, [data-testid="speed-slider"]',
    pitchSlider: 'input[name="pitch"], .pitch-slider, [data-testid="pitch-slider"]',
    volumeSlider: 'input[name="volume"], .volume-slider, [data-testid="volume-slider"]',
    
    speedValue: '.speed-value, [data-testid="speed-value"]',
    pitchValue: '.pitch-value, [data-testid="pitch-value"]',
    volumeValue: '.volume-value, [data-testid="volume-value"]',
    
    // Language selection
    languageSelect: 'select[name="language"], #language-select, .language-select, [data-testid="language-select"]',
    
    // Generation controls
    generateButton: '.generate-button, [data-testid="generate-tts"]',
    previewButton: '.preview-button, [data-testid="preview-tts"]',
    stopButton: '.stop-button, [data-testid="stop-tts"]',
    
    // Audio player
    audioPlayer: 'audio, .audio-player, [data-testid="audio-player"]',
    playButton: '.play-button, [data-testid="play-audio"]',
    pauseButton: '.pause-button, [data-testid="pause-audio"]',
    progressBar: '.progress-bar, [data-testid="audio-progress"]',
    timeDisplay: '.time-display, [data-testid="audio-time"]',
    
    // Download and export
    downloadButton: '.download-button, [data-testid="download-audio"]',
    exportButton: '.export-button, [data-testid="export-audio"]',
    formatSelect: 'select[name="format"], .format-select, [data-testid="audio-format"]',
    qualitySelect: 'select[name="quality"], .quality-select, [data-testid="audio-quality"]',
    
    // Processing status
    processingIndicator: '.processing, .generating, [data-testid="processing"]',
    progressIndicator: '.progress-indicator, [data-testid="generation-progress"]',
    statusMessage: '.status-message, [data-testid="status-message"]',
    
    // History and projects
    saveProjectButton: '.save-project, [data-testid="save-project"]',
    projectNameInput: 'input[name="projectName"], [data-testid="project-name"]',
    historyList: '.history-list, [data-testid="tts-history"]',
    historyItem: '.history-item, [data-testid="history-item"]',
    
    // Error handling
    errorMessage: '.error-message, .alert-error, [data-testid="error"]',
    warningMessage: '.warning-message, .alert-warning, [data-testid="warning"]',
    
    // Advanced settings
    advancedSettingsToggle: '.advanced-settings-toggle, [data-testid="advanced-settings"]',
    ssmlInput: '.ssml-input, [data-testid="ssml-input"]',
    emotionSelect: '.emotion-select, [data-testid="emotion-select"]',
    pronunciationInput: '.pronunciation-input, [data-testid="pronunciation"]'
  };

  constructor(page: Page) {
    super(page, '/tts/create');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector(this.selectors.textInput, 10000);
      await this.waitForSelector(this.selectors.generateButton, 10000);
      return true;
    } catch {
      return false;
    }
  }

  // Text input methods
  async enterText(text: string): Promise<void> {
    await this.type(this.selectors.textInput, text);
  }

  async clearText(): Promise<void> {
    await this.clearInput(this.selectors.textInput);
  }

  async getText(): Promise<string> {
    return await this.getValue(this.selectors.textInput);
  }

  async getCharacterCount(): Promise<number> {
    if (await this.isVisible(this.selectors.textCounter)) {
      const counterText = await this.getText(this.selectors.textCounter);
      const match = counterText.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    
    // Fallback: count characters in text input
    const text = await this.getText();
    return text.length;
  }

  async getMaxCharacterLimit(): Promise<number> {
    if (await this.isVisible(this.selectors.textCounter)) {
      const counterText = await this.getText(this.selectors.textCounter);
      const match = counterText.match(/\d+\/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    
    return 0;
  }

  async isTextLimitExceeded(): Promise<boolean> {
    const currentCount = await this.getCharacterCount();
    const maxLimit = await this.getMaxCharacterLimit();
    
    return maxLimit > 0 && currentCount > maxLimit;
  }

  // Voice selection methods
  async selectVoice(voiceName: string): Promise<void> {
    if (await this.isVisible(this.selectors.voiceSelect)) {
      // Simple select dropdown
      await this.selectOption(this.selectors.voiceSelect, voiceName);
    } else if (await this.isVisible(this.selectors.voiceList)) {
      // Voice cards/list interface
      await this.searchVoice(voiceName);
      await this.click(`${this.selectors.voiceCard}[data-voice="${voiceName}"]`);
    }
  }

  async searchVoice(query: string): Promise<void> {
    if (await this.isVisible(this.selectors.voiceSearchInput)) {
      await this.type(this.selectors.voiceSearchInput, query);
      await this.page.waitForTimeout(1000); // Wait for search results
    }
  }

  async previewVoice(voiceName?: string): Promise<void> {
    if (voiceName) {
      await this.selectVoice(voiceName);
    }
    
    if (await this.isVisible(this.selectors.voicePreviewButton)) {
      await this.click(this.selectors.voicePreviewButton);
    }
  }

  async getSelectedVoice(): Promise<string> {
    if (await this.isVisible(this.selectors.selectedVoice)) {
      return await this.getText(this.selectors.selectedVoice);
    } else if (await this.isVisible(this.selectors.voiceSelect)) {
      return await this.page.$eval(this.selectors.voiceSelect, el => (el as HTMLSelectElement).value);
    }
    
    return '';
  }

  async getAvailableVoices(): Promise<string[]> {
    if (await this.isVisible(this.selectors.voiceSelect)) {
      return await this.page.$$eval(`${this.selectors.voiceSelect} option`, options =>
        options.map(option => option.textContent?.trim() || '').filter(text => text)
      );
    } else if (await this.isVisible(this.selectors.voiceList)) {
      return await this.page.$$eval(this.selectors.voiceCard, cards =>
        cards.map(card => card.getAttribute('data-voice') || card.textContent?.trim() || '').filter(text => text)
      );
    }
    
    return [];
  }

  // Voice settings methods
  async setSpeed(value: number): Promise<void> {
    if (await this.isVisible(this.selectors.speedSlider)) {
      await this.page.evaluate((selector, val) => {
        const slider = document.querySelector(selector) as HTMLInputElement;
        if (slider) {
          slider.value = val.toString();
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, this.selectors.speedSlider, value);
    }
  }

  async setPitch(value: number): Promise<void> {
    if (await this.isVisible(this.selectors.pitchSlider)) {
      await this.page.evaluate((selector, val) => {
        const slider = document.querySelector(selector) as HTMLInputElement;
        if (slider) {
          slider.value = val.toString();
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, this.selectors.pitchSlider, value);
    }
  }

  async setVolume(value: number): Promise<void> {
    if (await this.isVisible(this.selectors.volumeSlider)) {
      await this.page.evaluate((selector, val) => {
        const slider = document.querySelector(selector) as HTMLInputElement;
        if (slider) {
          slider.value = val.toString();
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, this.selectors.volumeSlider, value);
    }
  }

  async getSpeed(): Promise<number> {
    if (await this.isVisible(this.selectors.speedSlider)) {
      const value = await this.getValue(this.selectors.speedSlider);
      return parseFloat(value) || 1.0;
    }
    return 1.0;
  }

  async getPitch(): Promise<number> {
    if (await this.isVisible(this.selectors.pitchSlider)) {
      const value = await this.getValue(this.selectors.pitchSlider);
      return parseFloat(value) || 1.0;
    }
    return 1.0;
  }

  async getVolume(): Promise<number> {
    if (await this.isVisible(this.selectors.volumeSlider)) {
      const value = await this.getValue(this.selectors.volumeSlider);
      return parseFloat(value) || 1.0;
    }
    return 1.0;
  }

  // Language methods
  async selectLanguage(language: string): Promise<void> {
    if (await this.isVisible(this.selectors.languageSelect)) {
      await this.selectOption(this.selectors.languageSelect, language);
    }
  }

  async getSelectedLanguage(): Promise<string> {
    if (await this.isVisible(this.selectors.languageSelect)) {
      return await this.page.$eval(this.selectors.languageSelect, el => (el as HTMLSelectElement).value);
    }
    return '';
  }

  // Generation methods
  async generateTTS(): Promise<void> {
    await this.click(this.selectors.generateButton);
  }

  async previewTTS(): Promise<void> {
    if (await this.isVisible(this.selectors.previewButton)) {
      await this.click(this.selectors.previewButton);
    }
  }

  async stopGeneration(): Promise<void> {
    if (await this.isVisible(this.selectors.stopButton)) {
      await this.click(this.selectors.stopButton);
    }
  }

  async isGenerating(): Promise<boolean> {
    return await this.isVisible(this.selectors.processingIndicator);
  }

  async waitForGeneration(timeout: number = 60000): Promise<void> {
    // Wait for processing to start
    await this.waitForElement(this.selectors.processingIndicator, 'visible', 10000);
    
    // Wait for processing to complete
    await this.waitForElement(this.selectors.processingIndicator, 'hidden', timeout);
  }

  async getGenerationProgress(): Promise<number> {
    if (await this.isVisible(this.selectors.progressIndicator)) {
      const progressText = await this.getText(this.selectors.progressIndicator);
      const match = progressText.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    }
    
    return 0;
  }

  async getStatusMessage(): Promise<string> {
    if (await this.isVisible(this.selectors.statusMessage)) {
      return await this.getText(this.selectors.statusMessage);
    }
    return '';
  }

  // Audio player methods
  async playAudio(): Promise<void> {
    if (await this.isVisible(this.selectors.playButton)) {
      await this.click(this.selectors.playButton);
    } else if (await this.isVisible(this.selectors.audioPlayer)) {
      await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        if (audio) audio.play();
      }, this.selectors.audioPlayer);
    }
  }

  async pauseAudio(): Promise<void> {
    if (await this.isVisible(this.selectors.pauseButton)) {
      await this.click(this.selectors.pauseButton);
    } else if (await this.isVisible(this.selectors.audioPlayer)) {
      await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        if (audio) audio.pause();
      }, this.selectors.audioPlayer);
    }
  }

  async isAudioPlaying(): Promise<boolean> {
    if (await this.isVisible(this.selectors.audioPlayer)) {
      return await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        return audio ? !audio.paused : false;
      }, this.selectors.audioPlayer);
    }
    
    return await this.isVisible(this.selectors.pauseButton);
  }

  async getAudioDuration(): Promise<number> {
    if (await this.isVisible(this.selectors.audioPlayer)) {
      return await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        return audio ? audio.duration : 0;
      }, this.selectors.audioPlayer);
    }
    
    return 0;
  }

  async getCurrentTime(): Promise<number> {
    if (await this.isVisible(this.selectors.audioPlayer)) {
      return await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        return audio ? audio.currentTime : 0;
      }, this.selectors.audioPlayer);
    }
    
    return 0;
  }

  // Download and export methods
  async downloadAudio(): Promise<void> {
    if (await this.isVisible(this.selectors.downloadButton)) {
      await this.click(this.selectors.downloadButton);
    }
  }

  async exportAudio(): Promise<void> {
    if (await this.isVisible(this.selectors.exportButton)) {
      await this.click(this.selectors.exportButton);
    }
  }

  async selectAudioFormat(format: string): Promise<void> {
    if (await this.isVisible(this.selectors.formatSelect)) {
      await this.selectOption(this.selectors.formatSelect, format);
    }
  }

  async selectAudioQuality(quality: string): Promise<void> {
    if (await this.isVisible(this.selectors.qualitySelect)) {
      await this.selectOption(this.selectors.qualitySelect, quality);
    }
  }

  // Project methods
  async saveProject(projectName: string): Promise<void> {
    if (await this.isVisible(this.selectors.saveProjectButton)) {
      if (await this.isVisible(this.selectors.projectNameInput)) {
        await this.type(this.selectors.projectNameInput, projectName);
      }
      await this.click(this.selectors.saveProjectButton);
    }
  }

  // Error handling
  async getErrorMessage(): Promise<string> {
    if (await this.isVisible(this.selectors.errorMessage)) {
      return await this.getText(this.selectors.errorMessage);
    }
    return '';
  }

  async getWarningMessage(): Promise<string> {
    if (await this.isVisible(this.selectors.warningMessage)) {
      return await this.getText(this.selectors.warningMessage);
    }
    return '';
  }

  async hasErrors(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  // Complete TTS workflow
  async generateTTSWithSettings(options: {
    text: string;
    voice?: string;
    language?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
    format?: string;
    quality?: string;
  }): Promise<void> {
    const { text, voice, language, speed, pitch, volume, format, quality } = options;
    
    // Enter text
    await this.enterText(text);
    
    // Set voice if specified
    if (voice) await this.selectVoice(voice);
    
    // Set language if specified
    if (language) await this.selectLanguage(language);
    
    // Set audio parameters
    if (speed !== undefined) await this.setSpeed(speed);
    if (pitch !== undefined) await this.setPitch(pitch);
    if (volume !== undefined) await this.setVolume(volume);
    
    // Set export format if specified
    if (format) await this.selectAudioFormat(format);
    if (quality) await this.selectAudioQuality(quality);
    
    // Generate TTS
    await this.generateTTS();
    await this.waitForGeneration();
  }

  // Quick test methods
  async performQuickTTSTest(): Promise<boolean> {
    try {
      await this.enterText('Hello, this is a test of text-to-speech functionality.');
      await this.generateTTS();
      await this.waitForGeneration(30000);
      
      const hasError = await this.hasErrors();
      return !hasError;
    } catch {
      return false;
    }
  }
}