'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Mic,
  VolumeUp,
  Translate,
  Sparkles,
  Close,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
    : 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 50%, #fdf2f8 100%)',
}));

const FloatingIcon = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.secondary.main,
  color: 'white',
}));

const FeatureIcon = styled(Paper)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main + '1A',
  color: theme.palette.primary.main,
  margin: '0 auto 8px',
}));

export default function WelcomePage() {
  const router = useRouter();
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <StyledContainer maxWidth={false}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Paper
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #7c3aed 30%, #ec4899 90%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mic sx={{ fontSize: 20, color: 'white' }} />
          </Paper>
          <Typography variant="h6" fontWeight="bold">
            Voicify
          </Typography>
        </Box>

        <IconButton
          onClick={() => router.push('/app')}
          sx={{ color: 'text.secondary' }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          textAlign: 'center',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: 400, width: '100%' }}
        >
          {/* Animated Icons */}
          <motion.div variants={itemVariants} style={{ position: 'relative', marginBottom: 48 }}>
            <Paper
              sx={{
                width: 128,
                height: 128,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #7c3aed 30%, #ec4899 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative',
              }}
            >
              <Paper
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VolumeUp sx={{ fontSize: 48, color: 'white' }} />
              </Paper>
            </Paper>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ position: 'absolute', top: -16, right: -16 }}
            >
              <FloatingIcon>
                <Sparkles sx={{ fontSize: 16 }} />
              </FloatingIcon>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              style={{ position: 'absolute', bottom: -16, left: -16 }}
            >
              <FloatingIcon sx={{ width: 24, height: 24 }}>
                <Mic sx={{ fontSize: 12 }} />
              </FloatingIcon>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Transform Your Voice
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              Create stunning voice content with AI-powered text-to-speech,
              voice cloning, and real-time translation. Your words, their voice.
            </Typography>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <FeatureIcon>
                  <VolumeUp sx={{ fontSize: 24 }} />
                </FeatureIcon>
                <Typography variant="body2" color="text.secondary">
                  TTS
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <FeatureIcon>
                  <Mic sx={{ fontSize: 24 }} />
                </FeatureIcon>
                <Typography variant="body2" color="text.secondary">
                  Clone
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <FeatureIcon>
                  <Translate sx={{ fontSize: 24 }} />
                </FeatureIcon>
                <Typography variant="body2" color="text.secondary">
                  Translate
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/signup')}
                sx={{
                  background: 'linear-gradient(45deg, #7c3aed 30%, #ec4899 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #6d28d9 30%, #db2777 90%)',
                  },
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
                }}
              >
                Get Started
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'action.hover',
                  },
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                I Already Have an Account
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          By continuing, you agree to our{' '}
          <Typography
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Terms of Service
          </Typography>{' '}
          and{' '}
          <Typography
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Privacy Policy
          </Typography>
        </Typography>
      </Box>
    </StyledContainer>
  );
}
