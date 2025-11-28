import React from 'react';
import { Wand2, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-8 border-b border-red-500 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg shadow-lg shadow-red-500/20">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-red-500">
              NanoEdit AI
            </h1>
            <p className="text-xs text-red-600 font-medium tracking-wide">POWERED BY GEMINI 2.5</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-red-500 bg-black px-3 py-1.5 rounded-full border border-red-500">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span>Edit images with natural language</span>
        </div>
      </div>
    </header>
  );
};