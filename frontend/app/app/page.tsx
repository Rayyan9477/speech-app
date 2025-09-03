'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Container,
} from '@mui/material';
import {
  PlayArrow,
  Mic,
  Translate,
  LibraryMusic,
  TrendingUp,
  History,
} from '@mui/icons-material';

const features = [
  {
    title: 'Text to Speech',
    description: 'Convert text to natural speech with multiple voices',
    icon: PlayArrow,
    path: '/app/tts',
    color: 'primary.main',
  },
  {
    title: 'Voice Changer',
    description: 'Modify your voice in real-time with effects',
    icon: Mic,
    path: '/app/voice-changer',
    color: 'secondary.main',
  },
  {
    title: 'Voice Translate',
    description: 'Translate speech across multiple languages',
    icon: Translate,
    path: '/app/voice-translate',
    color: 'success.main',
  },
  {
    title: 'Voice Library',
    description: 'Access and manage your saved voices',
    icon: LibraryMusic,
    path: '/app/voice-library',
    color: 'warning.main',
  },
];

const recentProjects = [
  {
    id: 1,
    title: 'Product Demo Script',
    type: 'TTS',
    time: '2 hours ago',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Voice Translation Project',
    type: 'Translation',
    time: '1 day ago',
    status: 'processing',
  },
  {
    id: 3,
    title: 'Custom Voice Creation',
    type: 'Voice Cloning',
    time: '3 days ago',
    status: 'completed',
  },
];

export default function AppHomePage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to transform your voice with AI?
          </Typography>
        </Box>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => router.push(feature.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: feature.color + '20',
                        color: feature.color,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      <feature.icon />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="600">
                      {feature.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Recent Projects */}
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Recent Projects
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<History />}
              onClick={() => router.push('/app/projects')}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {recentProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ flex: 1 }}>
                      {project.title}
                    </Typography>
                    <Chip
                      label={project.type}
                      size="small"
                      color={
                        project.type === 'TTS' ? 'primary' :
                        project.type === 'Translation' ? 'success' : 'warning'
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {project.time}
                  </Typography>
                  <Chip
                    label={project.status}
                    size="small"
                    color={project.status === 'completed' ? 'success' : 'warning'}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 4 }}>
            This Week
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  24
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projects
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <PlayArrow sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Audio Files
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Translate sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Languages
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Mic sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Voices
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </motion.div>
    </Container>
  );
}
