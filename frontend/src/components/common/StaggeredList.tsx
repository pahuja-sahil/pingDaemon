import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
      mass: 0.8,
    },
  },
};

const StaggeredList = ({ 
  children, 
  className = '', 
  staggerDelay = 0.1 
}: StaggeredListProps) => {
  const containerVariantsWithCustomDelay = {
    ...containerVariants,
    animate: {
      ...containerVariants.animate,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariantsWithCustomDelay}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredList;