import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';

interface TextDisplayProps {
  title: string;
  text: string;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ title, text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{text || 'No text to display'}</p>
      </CardContent>
    </Card>
  );
};

export default TextDisplay;

