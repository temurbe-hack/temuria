import React from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 'lg', className = '', onClick }) => {
  return (
    <div 
      className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      <div className={`
        relative flex items-center justify-center font-serif font-bold text-[#FDFBF7] bg-[#3E3C38] rounded-sm shadow-sm
        ${size === 'lg' ? 'w-12 h-12 text-3xl' : 'w-8 h-8 text-xl'}
      `}>
        T
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#D6D2C4] rounded-full border-2 border-[#FDFBF7]"></div>
      </div>
      <div className="flex flex-col">
        <span className={`font-serif font-bold text-[#3E3C38] leading-tight ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
          Temuria
          <span className="text-[#948F7F]">.we</span>
        </span>
        {size === 'lg' && (
          <span className="text-xs text-[#78756E] font-sans tracking-wide uppercase">The Live Encyclopedia</span>
        )}
      </div>
    </div>
  );
};