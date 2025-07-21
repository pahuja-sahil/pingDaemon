import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

const ThemeToggle = () => {
  const { isDark, toggle } = useThemeStore();

  return (
    <motion.button
      onClick={toggle}
      className={`
        relative w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
      `}
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle Switch */}
      <motion.div
        className={`
          w-5 h-5 rounded-full shadow-md flex items-center justify-center
          ${isDark ? 'bg-gray-800' : 'bg-white'}
        `}
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {/* Sun Icon */}
        <motion.div
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 180 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="w-3 h-3 text-yellow-500" />
        </motion.div>

        {/* Moon Icon */}
        <motion.div
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -180,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="w-3 h-3 text-blue-400" />
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;