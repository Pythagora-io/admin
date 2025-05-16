import React from 'react';

interface PageSubtitleProps {
  children: React.ReactNode;
}

export const PageSubtitle: React.FC<PageSubtitleProps> = ({ children }) => {
  return (
    <p className="text-[#F7F8F8] font-geist text-[14px] font-normal font-[400] leading-[130%] tracking-[-0.28px] opacity-60">
      {children}
    </p>
  );
}; 