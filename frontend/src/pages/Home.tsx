import React, { useState } from 'react';
import AudioUploader from '../components/AudioUploader';
import LanguageSelector from '../components/LanguageSelector';
import TextDisplay from '../components/TextDisplay';
import AudioPlayer from '../components/AudioPlayer';
import { transcribe, synthesize, translate } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const Home: React.FC = () => {
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranscription = async (file: File) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await transcribe(file);
      setTranscription(result.transcription);
    } catch (err) {
      setError('Transcription failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleTranslation = async () => {
    if (!transcription) {
      setError('Please transcribe audio first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await translate(transcription, selectedLanguage);
      setTranslation(result.translated_text);
    } catch (err) {
      setError('Translation failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSynthesis = async () => {
    const textToSynthesize = translation || transcription;
    if (!textToSynthesize) {
      setError('Please transcribe or translate text first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await synthesize(textToSynthesize, selectedLanguage);
      setAudioUrl(result.audio_url);
    } catch (err) {
      setError('Speech synthesis failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">AI Language Processor</h1>
      <Card>
        <CardContent className="p-6">
          <AudioUploader onUpload={handleTranscription} isLoading={isLoading} />
          <TextDisplay title="Transcription" text={transcription} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          <Button
            onClick={handleTranslation}
            disabled={isLoading || !transcription}
            className="w-full"
          >
            Translate
          </Button>
          <TextDisplay title="Translation" text={translation} />
          <Button
            onClick={handleSynthesis}
            disabled={isLoading || (!translation && !transcription)}
            className="w-full"
          >
            Synthesize Speech
          </Button>
          {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
        </CardContent>
      </Card>
      {error && (
        <div className="text-red-500 text-center font-semibold">{error}</div>
      )}
    </div>
  );
};

export default Home;

