import React from "react";
import { Link } from "react-router-dom";
import PythagoraIcon from "./icons/PythagoraIcon";
import AuthPagesFooterIcons from "./icons/AuthPagesFooterIcons";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden p-4">
      <div className="flex flex-col flex-1 relative overflow-hidden w-full h-full bg-window-blur backdrop-blur-[32px] border border-window-border rounded-2xl">
        {/* Logo at top left */}
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2" tabIndex={0}>
            <PythagoraIcon />
            <span className="font-semibold text-lg text-foreground">
              Pythagora
            </span>
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex justify-center items-center">
          <div className="w-full max-w-lg bg-frosted-black border border-frosted-border rounded-2xl px-8 py-10">
            {children}
          </div>
        </div>

        {/* Footer Icons */}
      </div>
      <div className="fixed -bottom-[40%] -left-40 -right-10 w-full -z-10">
        <AuthPagesFooterIcons className="w-full min-w-[1800px] min-h-[300px] shrink-0" />
      </div>
    </div>
  );
};
