const API_BASE_URL = '/api';  // Use relative path

export const transcribe = async (file: File): Promise<{ transcription: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  return response.json();
};

export const translate = async (text: string, targetLanguage: string): Promise<{ translated_text: string }> => {
  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, target_language: targetLanguage }),
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  return response.json();
};

export const synthesize = async (text: string, language: string): Promise<{ audio_url: string }> => {
  const response = await fetch(`${API_BASE_URL}/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error('Speech synthesis failed');
  }

  return response.json();
};