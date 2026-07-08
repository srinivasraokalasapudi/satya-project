import React from "react";
import { motion } from "framer-motion";

/**
 * GlassCard
 * Shared glassmorphism surface used across the More dashboard.
 * Keeps hover-lift / gold-border / premium-shadow treatment consistent
 * across every card on the page.
 */
const GlassCard = ({
  as: Component = motion.div,
  onClick,
  className = "",
  interactive = false,
  children,
  ...rest
}) => {
  const base =
    "relative rounded-[20px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-premium overflow-hidden";

  const interactiveClasses = interactive
    ? "cursor-pointer transition-colors duration-300 hover:border-gold/50"
    : "";

  return (
    <Component
      onClick={onClick}
      whileHover={interactive ? { y: -4, boxShadow: "0 12px 34px rgba(212,175,55,0.16)" } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`${base} ${interactiveClasses} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
