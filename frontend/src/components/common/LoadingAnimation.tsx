import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingAnimation = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingAnimationProps) => {
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      dot: 'w-2 h-2',
      text: 'text-sm',
    },
    md: {
      container: 'w-24 h-24',
      dot: 'w-3 h-3',
      text: 'text-base',
    },
    lg: {
      container: 'w-32 h-32',
      dot: 'w-4 h-4',
      text: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  const bounceVariants = {
    start: {
      y: 0,
      scale: 1,
    },
    bounce: {
      y: [-8, 0, -8],
      scale: [1, 0.8, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    start: {
      scale: 0.8,
      opacity: 0.5,
    },
    pulse: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Animated Dots */}
      <div className={`relative ${config.container} flex items-center justify-center`}>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20"
          variants={pulseVariants}
          initial="start"
          animate="pulse"
        />
        
        {/* Bouncing dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`${config.dot} bg-blue-600 rounded-full`}
              variants={bounceVariants}
              initial="start"
              animate="bounce"
              transition={{
                delay: index * 0.2,
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        className={`${config.text} text-gray-600 dark:text-gray-400 font-medium`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default LoadingAnimation;