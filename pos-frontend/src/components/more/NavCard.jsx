import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import GlassCard from "./GlassCard";

const NavCard = ({ icon: Icon, title, description, onClick, badge, index = 0 }) => {
  return (
    <GlassCard
      interactive
      onClick={onClick}
      className="p-5 group"
      as={motion.div}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <div className="flex items-start justify-between">
        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 group-hover:border-gold/50 group-hover:bg-gold/10 transition-colors duration-300">
          <Icon size={21} className="text-gold" />
          {badge && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-obsidian">
              {badge}
            </span>
          )}
        </div>
        <ChevronRight
          size={18}
          className="text-gray-600 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-300 mt-2"
        />
      </div>

      <h3 className="text-white font-semibold mt-4 text-[15px]">{title}</h3>
      <p className="text-gray-500 text-sm mt-1 leading-snug">{description}</p>
    </GlassCard>
  );
};

export default NavCard;
