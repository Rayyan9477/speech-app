import anime from 'animejs';
import { motion } from 'framer-motion';

// Anime.js animation utilities
export const animeAnimations = {
  // Fade in animation
  fadeIn: (element: string | Element, duration = 1000) => {
    return anime({
      targets: element,
      opacity: [0, 1],
      duration,
      easing: 'easeOutQuad',
    });
  },

  // Slide in from left
  slideInLeft: (element: string | Element, duration = 1000) => {
    return anime({
      targets: element,
      translateX: [-100, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutQuad',
    });
  },

  // Slide in from right
  slideInRight: (element: string | Element, duration = 1000) => {
    return anime({
      targets: element,
      translateX: [100, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutQuad',
    });
  },

  // Scale in animation
  scaleIn: (element: string | Element, duration = 800) => {
    return anime({
      targets: element,
      scale: [0.8, 1],
      opacity: [0, 1],
      duration,
      easing: 'easeOutBack',
    });
  },

  // Bounce animation
  bounce: (element: string | Element, duration = 1000) => {
    return anime({
      targets: element,
      translateY: [0, -30, 0],
      duration,
      easing: 'easeInOutQuad',
    });
  },

  // Stagger animation for multiple elements
  staggerFadeIn: (elements: string | Element, delay = 100) => {
    return anime({
      targets: elements,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(delay),
      duration: 600,
      easing: 'easeOutQuad',
    });
  },

  // Pulse animation
  pulse: (element: string | Element) => {
    return anime({
      targets: element,
      scale: [1, 1.1, 1],
      duration: 1000,
      easing: 'easeInOutQuad',
      loop: true,
    });
  },

  // Shake animation
  shake: (element: string | Element) => {
    return anime({
      targets: element,
      translateX: [-10, 10, -10, 10, 0],
      duration: 500,
      easing: 'easeInOutQuad',
    });
  },

  // Typing effect
  typeText: (element: string | Element, text: string, speed = 50) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        (target as HTMLElement).innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return timer;
  },
};

// Framer Motion animation variants
export const framerVariants = {
  // Container variants
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  },

  // Item variants
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  },

  // Slide variants
  slideUp: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  slideDown: {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  slideLeft: {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  slideRight: {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  // Scale variants
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  scaleOut: {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  // Rotate variants
  rotateIn: {
    hidden: { rotate: -180, opacity: 0 },
    visible: {
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  // Bounce variants
  bounceIn: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  },
};

// Combined animation hook
export const useAnimations = () => {
  return {
    anime: animeAnimations,
    framer: framerVariants,
  };
};

// Page transition variants
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Button hover animations
export const buttonAnimations = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Card animations
export const cardAnimations = {
  hover: {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

// Loading animations
export const loadingAnimations = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
