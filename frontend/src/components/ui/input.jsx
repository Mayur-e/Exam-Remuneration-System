import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Input({ className, type, ...props }) {
  return (
    <motion.input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  );
}