import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const handleToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <motion.button
            onClick={handleToggle}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            aria-label="Toggle theme"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            {/* Sun/Moon toggle with animations */}
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: theme === 'dark' ? 0 : 1,
                        scale: theme === 'dark' ? 0 : 1,
                        rotate: theme === 'dark' ? -180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <svg
                        className="w-full h-full text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                </motion.div>
                
                {/* Moon icon */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        opacity: theme === 'dark' ? 1 : 0,
                        scale: theme === 'dark' ? 1 : 0,
                        rotate: theme === 'dark' ? 0 : 180,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <svg
                        className="w-full h-full text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                </motion.div>
            </div>

            {/* Pulsing effect for dark mode */}
            <motion.div
                className="absolute inset-0 rounded-lg border-2 border-transparent"
                animate={{
                    boxShadow: theme === 'dark' 
                        ? '0 0 0 0 rgba(147, 51, 234, 0)'
                        : '0 0 0 0 rgba(59, 130, 246, 0)',
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                }}
            />
        </motion.button>
    );
}