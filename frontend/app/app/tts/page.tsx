'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  VolumeUp,
  Settings,
} from '@mui/icons-material';

const voices = [
  { id: 'en-US-1', name: 'Emma', language: 'English (US)', gender: 'Female' },
  { id: 'en-US-2', name: 'James', language: 'English (US)', gender: 'Male' },
  { id: 'en-GB-1', name: 'Oliver', language: 'English (UK)', gender: 'Male' },
  { id: 'es-ES-1', name: 'Sofia', language: 'Spanish', gender: 'Female' },
  { id: 'fr-FR-1', name: 'Pierre', language: 'French', gender: 'Male' },
];

export default function TTSPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (!text.trim()) return;

    setIsPlaying(true);
    // TODO: Implement TTS API call
    console.log('Playing TTS:', { text, selectedVoice, speed, pitch });

    // Simulate playing
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleStop = () => {
    setIsPlaying(false);
    // TODO: Stop TTS playback
  };

  const selectedVoiceData = voices.find(voice => voice.id === selectedVoice);

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Text to Speech
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Convert your text into natural speech with AI-powered voices
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Main Input Section */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Enter Text
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                  onClick={isPlaying ? handleStop : handlePlay}
                  disabled={!text.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VolumeUp />}
                  disabled
                >
                  Download
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Settings Panel */}
          <Box sx={{ width: { xs: '100%', lg: 350 } }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings fontSize="small" />
                Voice Settings
              </Typography>

              {/* Voice Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Voice</InputLabel>
                <Select
                  value={selectedVoice}
                  label="Select Voice"
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {voices.map((voice) => (
                    <MenuItem key={voice.id} value={voice.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {voice.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {voice.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {voice.language} • {voice.gender}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Voice Preview */}
              {selectedVoiceData && (
                <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedVoiceData.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600">
                          {selectedVoiceData.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={selectedVoiceData.language}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={selectedVoiceData.gender}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Speed Control */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="500" gutterBottom>
                  Speed: {speed.toFixed(1)}x
                </Typography>
                <Slider
                  value={speed}
                  onChange={(_, newValue) => setSpeed(newValue as number)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              {/* Pitch Control */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="500" gutterBottom>
                  Pitch: {pitch.toFixed(1)}x
                </Typography>
                <Slider
                  value={pitch}
                  onChange={(_, newValue) => setPitch(newValue as number)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: 'primary.main' }}
                />
              </Box>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" size="small" fullWidth>
                  Save Voice Settings
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  Voice Library
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  Recent Projects
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
}
