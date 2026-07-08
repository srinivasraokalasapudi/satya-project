import React from "react";

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-gold-light to-gold-dark" />
      <div>
        <h2 className="text-white text-xl md:text-2xl font-semibold tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
