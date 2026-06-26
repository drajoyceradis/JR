import React from 'react';

interface EliteLogoProps {
  className?: string;
}

export const EliteLogo: React.FC<EliteLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <span className="font-serif text-2xl md:text-[28px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F8F8F8] leading-[1.1]">
        Joyce Radis
      </span>
      <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#8e8e8e] mt-1.5 font-light leading-none">
        Clínica Médica & Perícia
      </span>
    </div>
  );
};
