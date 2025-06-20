"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

export const AppBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left Column: Icon and Text */}
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
            />
          </svg>
          <span className="font-bold text-lg">Agent Hunt</span>
        </div>

        {/* Center Column: Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Dashboard</Button>
        </div>

        {/* Right Column: Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:block">
            Get Started
          </Button>
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
};
