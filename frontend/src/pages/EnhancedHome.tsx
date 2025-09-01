import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

import AudioUploader from '../components/AudioUploader';
import LanguageSelector from '../components/LanguageSelector';
import TextDisplay from '../components/TextDisplay';
import AudioPlayer from '../components/AudioPlayer';
import VoiceCloneCreator from '../components/VoiceCloning/VoiceCloneCreator';
import VoiceCloneList from '../components/VoiceCloning/VoiceCloneList';
import TTSControls from '../components/AdvancedTTS/TTSControls';

import { apiClient } from '../api/client';
import type { TranscriptionResponse, VoiceCloneResponse } from '../api/client';
import { Mic, MessageSquare, Volume2, Users, Sparkles } from 'lucide-react';

const EnhancedHome: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Voice cloning states
  const [selectedVoiceClone, setSelectedVoiceClone] = useState('');
  const [voiceCloneRefresh, setVoiceCloneRefresh] = useState(false);
  
  // Current text for TTS
  const [currentText, setCurrentText] = useState('');
  const [activeTab, setActiveTab] = useState('transcribe');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleError = (message: string) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleTranscription = async (file: File) => {
    setIsLoading(true);
    clearMessages();
    
    try {
      const response = await apiClient.transcribeAudio(file, selectedLanguage || undefined);
      setTranscription(response.transcription);
      setCurrentText(response.transcription);
      handleSuccess('Audio transcribed successfully!');
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslation = async () => {
    if (!transcription.trim()) {
      handleError('Please transcribe audio first');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await apiClient.translateText(
        transcription,
        selectedLanguage || 'en',
        targetLanguage
      );
      setTranslation(response.translated_text);
      setCurrentText(response.translated_text);
      handleSuccess('Text translated successfully!');
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCloneCreated = (clone: VoiceCloneResponse) => {
    handleSuccess(`Voice clone "${clone.name}" created successfully!`);
    setVoiceCloneRefresh(!voiceCloneRefresh);
  };

  const handleVoiceCloneSelected = (cloneId: string) => {
    setSelectedVoiceClone(cloneId);
    if (cloneId) {
      handleSuccess('Voice clone selected for synthesis');
    }
  };

  const handleAudioGenerated = (audioUrl: string) => {
    setAudioUrl(audioUrl);
    handleSuccess('Speech generated successfully!');
  };

  const handleTextChange = (text: string) => {
    setCurrentText(text);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Language Processor
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced speech processing with voice cloning, ultra-realistic TTS, 
          and seamless translation powered by state-of-the-art AI models
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="text-red-500 font-medium">Error:</div>
            <div className="text-red-700 ml-2">{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="text-green-500 font-medium">Success:</div>
            <div className="text-green-700 ml-2">{success}</div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transcribe" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Transcribe
          </TabsTrigger>
          <TabsTrigger value="translate" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="synthesize" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Synthesize
          </TabsTrigger>
          <TabsTrigger value="voice-cloning" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Voice Cloning
          </TabsTrigger>
        </TabsList>

        {/* Speech-to-Text Tab */}
        <TabsContent value="transcribe" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-semibold">Speech to Text</h2>
              </div>
              
              <div className="space-y-4">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  label="Source Language (optional - auto-detect if not specified)"
                />
                
                <AudioUploader 
                  onUpload={handleTranscription} 
                  isLoading={isLoading} 
                />
                
                {transcription && (
                  <TextDisplay 
                    title="Transcription Result" 
                    text={transcription}
                    onTextChange={handleTextChange}
                    editable
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translation Tab */}
        <TabsContent value="translate" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h2 className="text-2xl font-semibold">Translation</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    label="Source Language"
                  />
                  <LanguageSelector
                    selectedLanguage={targetLanguage}
                    onLanguageChange={setTargetLanguage}
                    label="Target Language"
                  />
                </div>

                {transcription && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Original Text:</h4>
                    <p className="text-gray-900">{transcription}</p>
                  </div>
                )}

                <Button
                  onClick={handleTranslation}
                  disabled={isLoading || !transcription.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Translating...' : 'Translate Text'}
                </Button>

                {translation && (
                  <TextDisplay
                    title="Translation Result"
                    text={translation}
                    onTextChange={handleTextChange}
                    editable
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text-to-Speech Tab */}
        <TabsContent value="synthesize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Volume2 className="h-5 w-5 text-purple-500" />
                    <h2 className="text-2xl font-semibold">Text Input</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      placeholder="Enter text to synthesize or use transcribed/translated text..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      maxLength={5000}
                    />
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{currentText.length}/5000 characters</span>
                      <div className="space-x-2">
                        {transcription && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentText(transcription)}
                          >
                            Use Transcription
                          </Button>
                        )}
                        {translation && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentText(translation)}
                          >
                            Use Translation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {audioUrl && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Generated Audio</h3>
                    <AudioPlayer audioUrl={audioUrl} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <TTSControls
                text={currentText}
                onAudioGenerated={handleAudioGenerated}
                onError={handleError}
                selectedVoiceClone={selectedVoiceClone}
              />
            </div>
          </div>
        </TabsContent>

        {/* Voice Cloning Tab */}
        <TabsContent value="voice-cloning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <VoiceCloneCreator
                onCloneCreated={handleVoiceCloneCreated}
                onError={handleError}
              />
            </div>

            <div>
              <VoiceCloneList
                onSelectClone={handleVoiceCloneSelected}
                selectedCloneId={selectedVoiceClone}
                onError={handleError}
                refresh={voiceCloneRefresh}
              />
            </div>
          </div>

          {selectedVoiceClone && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Test Your Voice Clone</h3>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="Enter text to test with your cloned voice..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    maxLength={1000}
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{currentText.length}/1000 characters</span>
                    <Button
                      onClick={() => handleAudioGenerated('test')}
                      disabled={!currentText.trim() || isLoading}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Test Voice Clone
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Feature Overview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Features Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Mic className="h-8 w-8 text-blue-500 mb-2" />
              <h4 className="font-medium text-blue-900">Advanced STT</h4>
              <p className="text-sm text-blue-700">Whisper Large V3 Turbo with multilingual support</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-medium text-green-900">Smart Translation</h4>
              <p className="text-sm text-green-700">Privacy-focused with open-source models</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Volume2 className="h-8 w-8 text-purple-500 mb-2" />
              <h4 className="font-medium text-purple-900">Ultra-Realistic TTS</h4>
              <p className="text-sm text-purple-700">Dia 1.6B with emotional control</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <Users className="h-8 w-8 text-yellow-500 mb-2" />
              <h4 className="font-medium text-yellow-900">Voice Cloning</h4>
              <p className="text-sm text-yellow-700">Create and use personalized voices</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedHome;