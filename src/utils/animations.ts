import { Variants } from "framer-motion";

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20,
      mass: 0.8
    }
  }
};

// A much simpler, lighter animation for inner pages to prevent lag
export const simplePageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Subtle, premium animation without lag-inducing blur filters
export const premiumPageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.985
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Apple-like smooth cubic-bezier deceleration
    }
  }
};
