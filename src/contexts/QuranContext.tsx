
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface QuranVerse {
  surah: string;
  ayat: string;
  text: string;
  reference: string;
  originalArabic: string;
}

const QURAN_VERSES: QuranVerse[] = [
  {
    surah: 'Al-Imran',
    ayat: '3:8',
    originalArabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    text: '"Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower."',
    reference: 'Surah Al-Imran 3:8',
  },
  {
    surah: 'Al-Imran',
    ayat: '3:9',
    originalArabic: 'رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَّا رَيْبَ فِيهِ ۚ إِنَّ اللَّهَ لَا يُخْلِفُ الْمِيعَادَ',
    text: '"Our Lord, surely You will gather the people for a Day about which there is no doubt. Indeed, Allah does not fail in His promise."',
    reference: 'Surah Al-Imran 3:9',
  },
  {
    surah: 'Al-Baqarah',
    ayat: '2:255',
    originalArabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
    text: '"Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep..."',
    reference: 'Surah Al-Baqarah 2:255 (Ayatul Kursi)',
  },
  {
    surah: 'Al-Fatihah',
    ayat: '1:1-7',
    originalArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ',
    text: '"In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds..."',
    reference: 'Surah Al-Fatihah 1:1-7',
  },
  {
    surah: 'Al-Ikhlas',
    ayat: '112:1-4',
    originalArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    text: '"Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent."',
    reference: 'Surah Al-Ikhlas 112:1-4',
  },
];

interface QuranContextType {
  currentVerse: QuranVerse;
  getRandomAyah: () => { text: string; reference: string; originalArabic: string };
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export const QuranProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVerse, setCurrentVerse] = useState<QuranVerse>(QURAN_VERSES[0]);

  // Change verse every hour
  useEffect(() => {
    const getRandomVerse = () => {
      const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      setCurrentVerse(QURAN_VERSES[randomIndex]);
    };

    // Set initial verse
    getRandomVerse();

    // Change verse every hour
    const interval = setInterval(getRandomVerse, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  // Add the getRandomAyah function
  const getRandomAyah = () => {
    const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
    const verse = QURAN_VERSES[randomIndex];
    return {
      text: verse.text,
      reference: verse.reference,
      originalArabic: verse.originalArabic
    };
  };

  return (
    <QuranContext.Provider value={{ currentVerse, getRandomAyah }}>
      {children}
    </QuranContext.Provider>
  );
};

export const useQuran = (): QuranContextType => {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
};
