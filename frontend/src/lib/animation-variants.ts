/**
 * ORUS SAGE - Framer Motion Animation Variants
 * Aurora Visual Master Supreme v1.0
 * Data: 07/11/2025
 * 
 * ✨ Animações fluidas para landing
 * - Fade, slide, scale, stagger
 * - Container + item combos
 */

// ========================
// CONTAINER ANIMATIONS
// ========================

export const containerVariants = {
  // Fade in staggered
  fadeInUp: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  // Slide from left
  slideFromLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  },

  // Scale in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  },
};

// ========================
// ITEM ANIMATIONS
// ========================

export const itemVariants = {
  // Basic fade in up
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  // Fade in
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  // Slide from left
  slideFromLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  // Slide from right
  slideFromRight: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  // Scale in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  // Bounce scale
  bounceScale: {
    hidden: { opacity: 0, scale: 0.7 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  },
};

// ========================
// INTERACTIVE ANIMATIONS
// ========================

export const hoverVariants = {
  // Hover lift
  lift: {
    whileHover: {
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    whileTap: { scale: 0.95 },
  },

  // Hover scale
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  // Hover glow
  glow: {
    whileHover: { 
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
    },
    whileTap: { scale: 0.98 },
  },
};

// ========================
// SECTION ANIMATIONS
// ========================

export const sectionVariants = {
  // Hero section reveal
  heroReveal: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },

  // Features grid
  featuresGrid: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  },

  // Pricing cards
  pricingCards: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  // Testimonials carousel
  testimonialSlide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// ========================
// TEXT ANIMATIONS
// ========================

export const textVariants = {
  // Word reveal
  container: {
    hidden: { opacity: 0 },
    visible: (custom = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.04 * custom,
      },
    }),
  },

  item: {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  },

  // Character animation
  character: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  },
};

// ========================
// UTILITY ANIMATION BUILDERS
// ========================

/**
 * Cria animação de stagger para múltiplos itens
 * @param count - número de itens
 * @param delay - delay inicial
 * @param interval - intervalo entre itens
 */
export const createStaggerAnimation = (count: number, delay = 0, interval = 0.1) => {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: interval,
          delayChildren: delay,
        },
      },
    },
  };
};

/**
 * Cria animação de entrada com diferentes direções
 */
export const createEntranceAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  duration = 0.5,
  distance = 30
) => {
  const direction_map = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const offset = direction_map[direction];

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: 'easeOut',
      },
    },
  };
};

// ========================
// PRESET TRANSITIONS
// ========================

export const presetTransitions = {
  fast: { duration: 0.15, ease: 'easeInOut' },
  base: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  slower: { duration: 0.8, ease: 'easeInOut' },

  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 10,
  },

  bounce: {
    type: 'spring',
    stiffness: 200,
    damping: 10,
  },
};

export default {
  containerVariants,
  itemVariants,
  hoverVariants,
  sectionVariants,
  textVariants,
  presetTransitions,
};
