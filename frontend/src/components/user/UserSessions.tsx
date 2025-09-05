import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface Session {
  id: string;
  original_filename: string;
  file_size: number;
  duration_seconds?: number;
  transcription?: string;
  translation?: string;
  target_language?: string;
  created_at: string;
  updated_at: string;
}

export const UserSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      setIsLoading(true);
      // Since we don't have a specific endpoint yet, we'll simulate this
      // In a real implementation, you'd call an endpoint like /api/v1/sessions/me
      
      // For now, just show an empty state or mock data
      setSessions([]);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLanguageFlag = (langCode?: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
    };
    return flags[langCode || ''] || '🌐';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <Button
          onClick={fetchUserSessions}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h2>
          <p className="text-gray-600 mb-6">
            Start by uploading an audio file to create your first session.
            You&apos;ll be able to transcribe, translate, and create voice clones.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Upload Audio File
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.original_filename}
                    </h3>
                    {session.target_language && (
                      <span className="text-xl">
                        {getLanguageFlag(session.target_language)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <span>📁 {formatFileSize(session.file_size)}</span>
                    <span>⏱️ {formatDuration(session.duration_seconds)}</span>
                    <span>📅 {formatDate(session.created_at)}</span>
                  </div>

                  {session.transcription && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Transcription:</p>
                      <p className="text-gray-600 line-clamp-2">{session.transcription}</p>
                    </div>
                  )}

                  {session.translation && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Translation:</p>
                      <p className="text-gray-600 line-clamp-2">{session.translation}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedSession(session)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
              <Button
                onClick={() => setSelectedSession(null)}
                variant="outline"
                size="sm"
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedSession.original_filename}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">File Size:</span>
                    <span className="ml-2 text-gray-600">{formatFileSize(selectedSession.file_size)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{formatDuration(selectedSession.duration_seconds)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">{formatDate(selectedSession.created_at)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">{formatDate(selectedSession.updated_at)}</span>
                  </div>
                </div>
              </div>

              {selectedSession.transcription && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Transcription</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedSession.transcription}</p>
                  </div>
                </div>
              )}

              {selectedSession.translation && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    Translation {selectedSession.target_language && (
                      <span className="text-xl ml-2">
                        {getLanguageFlag(selectedSession.target_language)}
                      </span>
                    )}
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedSession.translation}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline">
                  Download Results
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Reprocess
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};