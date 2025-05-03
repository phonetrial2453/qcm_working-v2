
import React, { useEffect, useState } from 'react';
import { useQuran } from '@/contexts/QuranContext';

const AppFooter: React.FC = () => {
  const { getRandomAyah } = useQuran();
  const [ayah, setAyah] = useState({ text: '', reference: '', originalArabic: '' });
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const randomAyah = getRandomAyah();
    setAyah(randomAyah);
    
    // Add animation class after a delay to trigger the animation
    const timer = setTimeout(() => {
      setAnimationClass('animate-in');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [getRandomAyah]);

  return (
    <footer className="bg-islamic-primary text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`p-4 rounded-lg bg-islamic-primary/80 transition-all duration-1000 transform ${animationClass}`}>
            {ayah.originalArabic && (
              <p className="text-xl font-arabic leading-relaxed mb-3 transition-all hover:scale-105 duration-500" dir="rtl">
                {ayah.originalArabic}
              </p>
            )}
            <p className="text-xl quote-text leading-relaxed transition-all hover:scale-105 duration-500">
              {ayah.text}
            </p>
            <p className="text-sm text-islamic-accent mt-2">
              {ayah.reference}
            </p>
          </div>
          
          <p className="mt-6 text-xs text-islamic-accent/70">
            &copy; {new Date().getFullYear()} Quran Classes Application Manager. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
