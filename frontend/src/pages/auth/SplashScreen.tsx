import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Sparkles } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user is logged in or has seen walkthrough
      const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
      const isLoggedIn = localStorage.getItem('authToken');
      
      if (isLoggedIn) {
        navigate('/app');
      } else if (hasSeenWalkthrough) {
        navigate('/');
      } else {
        navigate('/walkthrough');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const logoVariants: any = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0 
    },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 1.2
      }
    }
  };

  const textVariants: any = {
    hidden: { 
      y: 30,
      opacity: 0 
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants: any = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Logo Animation */}
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        className="relative mb-8"
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="pulse"
          className="relative"
        >
          {/* Main Logo Circle */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Mic className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>

          <motion.div
            animate={{
              rotate: -360,
              y: [0, -10, 0]
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center"
          >
            <Volume2 className="w-3 h-3 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* App Name */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
          Voicify
        </h1>
        <p className="text-xl text-purple-200 font-light">
          Transform Your Voice
        </p>
      </motion.div>

      {/* Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-20"
      >
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-sm text-purple-300/60">
          Version 1.0.0
        </p>
      </motion.div>

      {/* Gradient Overlay for Polish */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-purple-900/20 pointer-events-none" />
    </div>
  );
};

export default SplashScreen;