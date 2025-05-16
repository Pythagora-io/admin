import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ children }) => {
  return (
    <h1 className="text-[#F7F8F8] font-geist text-[24px] font-normal font-[500] leading-[125%] tracking-[-0.48px] mb-2">
      {children}
    </h1>
  );
}; 