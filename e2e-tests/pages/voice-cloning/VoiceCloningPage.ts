import { Page } from 'puppeteer';
import { BasePage } from '../BasePage';

export class VoiceCloningPage extends BasePage {
  private selectors = {
    // File upload
    audioUploadInput: 'input[type="file"][accept*="audio"], #audio-upload, [data-testid="audio-upload"]',
    uploadButton: '.upload-button, [data-testid="upload-audio"]',
    dragDropArea: '.drag-drop-area, .upload-zone, [data-testid="drag-drop"]',
    uploadProgress: '.upload-progress, [data-testid="upload-progress"]',
    
    // Audio file management
    audioFileList: '.audio-file-list, [data-testid="audio-files"]',
    audioFileItem: '.audio-file-item, [data-testid="audio-file"]',
    removeFileButton: '.remove-file, [data-testid="remove-file"]',
    playFileButton: '.play-file, [data-testid="play-file"]',
    
    // Recording interface
    recordButton: '.record-button, [data-testid="start-recording"]',
    stopRecordingButton: '.stop-recording, [data-testid="stop-recording"]',
    pauseRecordingButton: '.pause-recording, [data-testid="pause-recording"]',
    recordingIndicator: '.recording-indicator, [data-testid="recording-status"]',
    recordingTimer: '.recording-timer, [data-testid="recording-time"]',
    
    // Voice clone settings
    voiceNameInput: 'input[name="voiceName"], #voice-name, [data-testid="voice-name"]',
    voiceDescriptionInput: 'textarea[name="description"], #voice-description, [data-testid="voice-description"]',
    genderSelect: 'select[name="gender"], #gender, [data-testid="gender-select"]',
    ageRangeSelect: 'select[name="ageRange"], #age-range, [data-testid="age-range"]',
    accentSelect: 'select[name="accent"], #accent, [data-testid="accent-select"]',
    
    // Quality settings
    qualitySelect: 'select[name="quality"], #quality, [data-testid="quality-select"]',
    enhancementToggle: 'input[name="enhancement"], #enhancement, [data-testid="enhancement-toggle"]',
    noiseReductionToggle: 'input[name="noiseReduction"], #noise-reduction, [data-testid="noise-reduction"]',
    
    // Processing
    createVoiceButton: '.create-voice-button, [data-testid="create-voice"]',
    processingIndicator: '.processing, .training, [data-testid="voice-processing"]',
    processingProgress: '.processing-progress, [data-testid="processing-progress"]',
    processingStatus: '.processing-status, [data-testid="processing-status"]',
    estimatedTime: '.estimated-time, [data-testid="estimated-time"]',
    
    // Voice preview
    previewButton: '.preview-button, [data-testid="preview-voice"]',
    previewTextInput: 'textarea[name="previewText"], .preview-text, [data-testid="preview-text"]',
    previewAudioPlayer: '.preview-audio, [data-testid="preview-audio"]',
    
    // Voice clone results
    resultContainer: '.voice-clone-result, [data-testid="clone-result"]',
    successMessage: '.success-message, [data-testid="success-message"]',
    voiceCloneCard: '.voice-clone-card, [data-testid="voice-clone-card"]',
    useVoiceButton: '.use-voice-button, [data-testid="use-voice"]',
    
    // My voices/library
    voicesLibrary: '.voices-library, [data-testid="voices-library"]',
    voicesList: '.voices-list, [data-testid="voices-list"]',
    voiceItem: '.voice-item, [data-testid="voice-item"]',
    editVoiceButton: '.edit-voice, [data-testid="edit-voice"]',
    deleteVoiceButton: '.delete-voice, [data-testid="delete-voice"]',
    
    // Audio requirements
    requirementsPanel: '.requirements-panel, [data-testid="requirements"]',
    audioRequirements: '.audio-requirements, [data-testid="audio-requirements"]',
    qualityIndicator: '.quality-indicator, [data-testid="quality-indicator"]',
    durationIndicator: '.duration-indicator, [data-testid="duration-indicator"]',
    
    // Error handling
    errorMessage: '.error-message, .alert-error, [data-testid="error"]',
    warningMessage: '.warning-message, .alert-warning, [data-testid="warning"]',
    validationError: '.validation-error, [data-testid="validation-error"]',
    
    // Steps/wizard
    stepIndicator: '.step-indicator, [data-testid="current-step"]',
    nextStepButton: '.next-step, [data-testid="next-step"]',
    previousStepButton: '.previous-step, [data-testid="previous-step"]',
    
    // Advanced settings
    advancedSettingsToggle: '.advanced-settings-toggle, [data-testid="advanced-settings"]',
    sampleRateSelect: '.sample-rate-select, [data-testid="sample-rate"]',
    bitRateSelect: '.bit-rate-select, [data-testid="bit-rate"]'
  };

  constructor(page: Page) {
    super(page, '/voice-cloning');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector(this.selectors.audioUploadInput, 10000);
      return true;
    } catch {
      return false;
    }
  }

  // File upload methods
  async uploadAudioFile(filePath: string): Promise<void> {
    await this.uploadFile(this.selectors.audioUploadInput, filePath);
    
    // Wait for upload to complete
    if (await this.isVisible(this.selectors.uploadProgress)) {
      await this.waitForElement(this.selectors.uploadProgress, 'hidden', 60000);
    }
  }

  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    const input = await this.page.$(this.selectors.audioUploadInput);
    if (input) {
      await input.uploadFile(...filePaths);
    }
    
    // Wait for all uploads to complete
    if (await this.isVisible(this.selectors.uploadProgress)) {
      await this.waitForElement(this.selectors.uploadProgress, 'hidden', 120000);
    }
  }

  async dragAndDropFile(filePath: string): Promise<void> {
    if (await this.isVisible(this.selectors.dragDropArea)) {
      const dropArea = await this.page.$(this.selectors.dragDropArea);
      if (dropArea) {
        // Simulate file drop
        const dataTransfer = await this.page.evaluateHandle(() => new DataTransfer());
        await this.page.dispatchEvent(this.selectors.dragDropArea, 'drop', { dataTransfer });
      }
    }
  }

  async getUploadedFiles(): Promise<string[]> {
    if (await this.isVisible(this.selectors.audioFileList)) {
      return await this.page.$$eval(this.selectors.audioFileItem, items =>
        items.map(item => item.textContent?.trim() || '').filter(text => text)
      );
    }
    return [];
  }

  async removeAudioFile(fileName: string): Promise<void> {
    const fileItems = await this.page.$$(this.selectors.audioFileItem);
    
    for (const item of fileItems) {
      const itemText = await item.evaluate(el => el.textContent?.trim());
      if (itemText?.includes(fileName)) {
        const removeButton = await item.$(this.selectors.removeFileButton);
        if (removeButton) {
          await removeButton.click();
          break;
        }
      }
    }
  }

  async playAudioFile(fileName: string): Promise<void> {
    const fileItems = await this.page.$$(this.selectors.audioFileItem);
    
    for (const item of fileItems) {
      const itemText = await item.evaluate(el => el.textContent?.trim());
      if (itemText?.includes(fileName)) {
        const playButton = await item.$(this.selectors.playFileButton);
        if (playButton) {
          await playButton.click();
          break;
        }
      }
    }
  }

  // Recording methods
  async startRecording(): Promise<void> {
    await this.click(this.selectors.recordButton);
    await this.waitForElement(this.selectors.recordingIndicator, 'visible');
  }

  async stopRecording(): Promise<void> {
    if (await this.isVisible(this.selectors.stopRecordingButton)) {
      await this.click(this.selectors.stopRecordingButton);
      await this.waitForElement(this.selectors.recordingIndicator, 'hidden');
    }
  }

  async pauseRecording(): Promise<void> {
    if (await this.isVisible(this.selectors.pauseRecordingButton)) {
      await this.click(this.selectors.pauseRecordingButton);
    }
  }

  async isRecording(): Promise<boolean> {
    return await this.isVisible(this.selectors.recordingIndicator);
  }

  async getRecordingTime(): Promise<string> {
    if (await this.isVisible(this.selectors.recordingTimer)) {
      return await this.getText(this.selectors.recordingTimer);
    }
    return '00:00';
  }

  // Voice settings methods
  async setVoiceName(name: string): Promise<void> {
    if (await this.isVisible(this.selectors.voiceNameInput)) {
      await this.type(this.selectors.voiceNameInput, name);
    }
  }

  async setVoiceDescription(description: string): Promise<void> {
    if (await this.isVisible(this.selectors.voiceDescriptionInput)) {
      await this.type(this.selectors.voiceDescriptionInput, description);
    }
  }

  async selectGender(gender: string): Promise<void> {
    if (await this.isVisible(this.selectors.genderSelect)) {
      await this.selectOption(this.selectors.genderSelect, gender);
    }
  }

  async selectAgeRange(ageRange: string): Promise<void> {
    if (await this.isVisible(this.selectors.ageRangeSelect)) {
      await this.selectOption(this.selectors.ageRangeSelect, ageRange);
    }
  }

  async selectAccent(accent: string): Promise<void> {
    if (await this.isVisible(this.selectors.accentSelect)) {
      await this.selectOption(this.selectors.accentSelect, accent);
    }
  }

  async selectQuality(quality: string): Promise<void> {
    if (await this.isVisible(this.selectors.qualitySelect)) {
      await this.selectOption(this.selectors.qualitySelect, quality);
    }
  }

  async toggleEnhancement(enable: boolean = true): Promise<void> {
    if (await this.isVisible(this.selectors.enhancementToggle)) {
      await this.checkCheckbox(this.selectors.enhancementToggle, enable);
    }
  }

  async toggleNoiseReduction(enable: boolean = true): Promise<void> {
    if (await this.isVisible(this.selectors.noiseReductionToggle)) {
      await this.checkCheckbox(this.selectors.noiseReductionToggle, enable);
    }
  }

  // Voice creation process
  async createVoiceClone(): Promise<void> {
    await this.click(this.selectors.createVoiceButton);
    await this.waitForElement(this.selectors.processingIndicator, 'visible', 10000);
  }

  async waitForVoiceProcessing(timeout: number = 300000): Promise<void> {
    // Wait for processing to complete (voice cloning can take a long time)
    await this.waitForElement(this.selectors.processingIndicator, 'hidden', timeout);
  }

  async getProcessingProgress(): Promise<number> {
    if (await this.isVisible(this.selectors.processingProgress)) {
      const progressText = await this.getText(this.selectors.processingProgress);
      const match = progressText.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  async getProcessingStatus(): Promise<string> {
    if (await this.isVisible(this.selectors.processingStatus)) {
      return await this.getText(this.selectors.processingStatus);
    }
    return '';
  }

  async getEstimatedTime(): Promise<string> {
    if (await this.isVisible(this.selectors.estimatedTime)) {
      return await this.getText(this.selectors.estimatedTime);
    }
    return '';
  }

  async isProcessing(): Promise<boolean> {
    return await this.isVisible(this.selectors.processingIndicator);
  }

  // Voice preview methods
  async previewVoice(text?: string): Promise<void> {
    if (text && await this.isVisible(this.selectors.previewTextInput)) {
      await this.type(this.selectors.previewTextInput, text);
    }
    
    if (await this.isVisible(this.selectors.previewButton)) {
      await this.click(this.selectors.previewButton);
    }
  }

  async playPreview(): Promise<void> {
    if (await this.isVisible(this.selectors.previewAudioPlayer)) {
      await this.page.evaluate((selector) => {
        const audio = document.querySelector(selector) as HTMLAudioElement;
        if (audio) audio.play();
      }, this.selectors.previewAudioPlayer);
    }
  }

  // Voice library management
  async getCreatedVoices(): Promise<string[]> {
    if (await this.isVisible(this.selectors.voicesList)) {
      return await this.page.$$eval(this.selectors.voiceItem, items =>
        items.map(item => {
          const nameElement = item.querySelector('.voice-name, [data-testid="voice-name"]');
          return nameElement?.textContent?.trim() || '';
        }).filter(name => name)
      );
    }
    return [];
  }

  async useVoice(voiceName: string): Promise<void> {
    const voiceItems = await this.page.$$(this.selectors.voiceItem);
    
    for (const item of voiceItems) {
      const itemText = await item.evaluate(el => el.textContent?.trim());
      if (itemText?.includes(voiceName)) {
        const useButton = await item.$(this.selectors.useVoiceButton);
        if (useButton) {
          await useButton.click();
          break;
        }
      }
    }
  }

  async editVoice(voiceName: string): Promise<void> {
    const voiceItems = await this.page.$$(this.selectors.voiceItem);
    
    for (const item of voiceItems) {
      const itemText = await item.evaluate(el => el.textContent?.trim());
      if (itemText?.includes(voiceName)) {
        const editButton = await item.$(this.selectors.editVoiceButton);
        if (editButton) {
          await editButton.click();
          break;
        }
      }
    }
  }

  async deleteVoice(voiceName: string): Promise<void> {
    const voiceItems = await this.page.$$(this.selectors.voiceItem);
    
    for (const item of voiceItems) {
      const itemText = await item.evaluate(el => el.textContent?.trim());
      if (itemText?.includes(voiceName)) {
        const deleteButton = await item.$(this.selectors.deleteVoiceButton);
        if (deleteButton) {
          await deleteButton.click();
          break;
        }
      }
    }
  }

  // Quality assessment
  async getAudioQuality(): Promise<string> {
    if (await this.isVisible(this.selectors.qualityIndicator)) {
      return await this.getText(this.selectors.qualityIndicator);
    }
    return '';
  }

  async getAudioDuration(): Promise<string> {
    if (await this.isVisible(this.selectors.durationIndicator)) {
      return await this.getText(this.selectors.durationIndicator);
    }
    return '';
  }

  async getAudioRequirements(): Promise<string[]> {
    if (await this.isVisible(this.selectors.audioRequirements)) {
      return await this.page.$$eval(`${this.selectors.audioRequirements} li`, items =>
        items.map(item => item.textContent?.trim() || '').filter(text => text)
      );
    }
    return [];
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

  async getValidationErrors(): Promise<string[]> {
    if (await this.isVisible(this.selectors.validationError)) {
      return await this.page.$$eval(this.selectors.validationError, errors =>
        errors.map(error => error.textContent?.trim() || '').filter(text => text)
      );
    }
    return [];
  }

  async hasErrors(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage) ||
           await this.isVisible(this.selectors.validationError);
  }

  // Wizard navigation
  async getCurrentStep(): Promise<number> {
    if (await this.isVisible(this.selectors.stepIndicator)) {
      const stepText = await this.getText(this.selectors.stepIndicator);
      const match = stepText.match(/step\s*(\d+)/i);
      return match ? parseInt(match[1]) : 1;
    }
    return 1;
  }

  async goToNextStep(): Promise<void> {
    if (await this.isVisible(this.selectors.nextStepButton) && 
        await this.isEnabled(this.selectors.nextStepButton)) {
      await this.click(this.selectors.nextStepButton);
    }
  }

  async goToPreviousStep(): Promise<void> {
    if (await this.isVisible(this.selectors.previousStepButton) && 
        await this.isEnabled(this.selectors.previousStepButton)) {
      await this.click(this.selectors.previousStepButton);
    }
  }

  // Complete voice cloning workflow
  async createVoiceFromFile(options: {
    filePath: string;
    voiceName: string;
    description?: string;
    gender?: string;
    ageRange?: string;
    accent?: string;
    quality?: string;
    enhancement?: boolean;
    noiseReduction?: boolean;
  }): Promise<void> {
    const {
      filePath,
      voiceName,
      description,
      gender,
      ageRange,
      accent,
      quality,
      enhancement,
      noiseReduction
    } = options;

    // Upload audio file
    await this.uploadAudioFile(filePath);

    // Set voice details
    await this.setVoiceName(voiceName);
    if (description) await this.setVoiceDescription(description);
    if (gender) await this.selectGender(gender);
    if (ageRange) await this.selectAgeRange(ageRange);
    if (accent) await this.selectAccent(accent);
    if (quality) await this.selectQuality(quality);
    
    // Set processing options
    if (enhancement !== undefined) await this.toggleEnhancement(enhancement);
    if (noiseReduction !== undefined) await this.toggleNoiseReduction(noiseReduction);

    // Create voice clone
    await this.createVoiceClone();
    await this.waitForVoiceProcessing();
  }

  async createVoiceFromRecording(options: {
    recordingDuration: number; // in seconds
    voiceName: string;
    description?: string;
    previewText?: string;
  }): Promise<void> {
    const { recordingDuration, voiceName, description, previewText } = options;

    // Record audio
    await this.startRecording();
    await this.page.waitForTimeout(recordingDuration * 1000);
    await this.stopRecording();

    // Set voice details
    await this.setVoiceName(voiceName);
    if (description) await this.setVoiceDescription(description);

    // Create and preview
    await this.createVoiceClone();
    await this.waitForVoiceProcessing();

    if (previewText) {
      await this.previewVoice(previewText);
    }
  }

  // Quick test methods
  async performQuickVoiceCloningTest(audioFilePath: string): Promise<boolean> {
    try {
      await this.uploadAudioFile(audioFilePath);
      await this.setVoiceName(`Test Voice ${Date.now()}`);
      await this.createVoiceClone();
      await this.waitForVoiceProcessing(180000); // 3 minutes timeout
      
      const hasError = await this.hasErrors();
      return !hasError;
    } catch {
      return false;
    }
  }
}