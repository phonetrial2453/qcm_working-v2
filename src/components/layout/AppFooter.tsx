
import React from 'react';
import { useQuran } from '@/contexts/QuranContext';

const AppFooter: React.FC = () => {
  const { currentVerse } = useQuran();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-islamic-primary py-6 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center max-w-2xl">
            <p className="italic text-islamic-accent mb-1">{currentVerse.text}</p>
            <p className="text-sm text-white/70">{currentVerse.reference}</p>
          </div>
          <div className="h-px w-24 bg-islamic-accent/30 my-2"></div>
          <p className="text-sm text-white/70">
            &copy; {year} Quran & Seerat Scribe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
