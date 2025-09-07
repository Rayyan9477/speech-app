import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { apiClient } from '../../api/client';
import { Trash2, Play, Mic } from 'lucide-react';

interface VoiceClone {
  clone_id: string;
  name: string;
  created_at?: string;
  status?: string;
}

interface VoiceCloneListProps {
  onSelectClone: (cloneId: string) => void;
  selectedCloneId?: string;
  onError: (error: string) => void;
  refresh?: boolean;
}

const VoiceCloneList: React.FC<VoiceCloneListProps> = ({ 
  onSelectClone, 
  selectedCloneId, 
  onError,
  refresh = false
}) => {
  const [clones, setClones] = useState<VoiceClone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVoiceClones = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.listVoiceClones();
      setClones(response.voice_clones || []);
    } catch (error) {
      onError('Failed to load voice clones');
      console.error('Failed to load voice clones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadVoiceClones();
  }, [refresh, loadVoiceClones]);

  const handleDeleteClone = async (cloneId: string, cloneName: string) => {
    if (!confirm(`Are you sure you want to delete "${cloneName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(cloneId);
    try {
      await apiClient.deleteVoiceClone(cloneId);
      setClones(clones.filter(clone => clone.clone_id !== cloneId));
      
      // If the deleted clone was selected, clear selection
      if (selectedCloneId === cloneId) {
        onSelectClone('');
      }
    } catch (error) {
      onError('Failed to delete voice clone');
      console.error('Failed to delete voice clone:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Voice Clones</h3>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Voice Clones</h3>
          <Button
            onClick={loadVoiceClones}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
        </div>

        {clones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mic className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No voice clones created yet</p>
            <p className="text-sm">Create your first voice clone above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clones.map((clone) => (
              <div
                key={clone.clone_id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedCloneId === clone.clone_id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => onSelectClone(clone.clone_id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900">
                        {clone.name}
                      </h4>
                      {clone.status && (
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${clone.status === 'created' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {clone.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      ID: {clone.clone_id.substring(0, 8)}...
                    </div>
                    
                    {clone.created_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {formatDate(clone.created_at)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClone(clone.clone_id, clone.name);
                      }}
                      disabled={deletingId === clone.clone_id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === clone.clone_id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceCloneList;