import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Edit3, Save, X } from 'lucide-react';

interface TextDisplayProps {
  title: string;
  text: string;
  editable?: boolean;
  onTextChange?: (text: string) => void;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ 
  title, 
  text, 
  editable = false, 
  onTextChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleEdit = () => {
    setEditedText(text);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onTextChange) {
      onTextChange(editedText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <div className="flex gap-2">
            {editable && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit} disabled={!text}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter text..."
          />
        ) : (
          <p className="whitespace-pre-wrap">{text || 'No text to display'}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TextDisplay;

