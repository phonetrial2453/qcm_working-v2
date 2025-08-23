
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Theme = 'light' | 'dark';
type ThemeColor = 'green' | 'blue' | 'purple' | 'brown' | 'teal' | 'indigo';

interface ThemeContextType {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default theme and color values to prevent undefined errors
const DEFAULT_THEME: Theme = 'light';
const DEFAULT_THEME_COLOR: ThemeColor = 'green';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [themeColor, setThemeColorState] = useState<ThemeColor>(DEFAULT_THEME_COLOR);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load preferences from localStorage and/or database
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // 1. Check localStorage first for quick loading
        const storedTheme = localStorage.getItem('theme') as Theme;
        const storedColor = localStorage.getItem('themeColor') as ThemeColor;
        
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
          document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        }
        
        // Validate theme color before applying it
        if (storedColor && isValidThemeColor(storedColor)) {
          setThemeColorState(storedColor);
          document.documentElement.setAttribute('data-theme-color', storedColor);
        }
        
        // 2. Then try to fetch from database if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: settings } = await supabase
            .from('app_settings')
            .select('key, value')
            .eq('key', `user_theme_${session.user.id}`)
            .maybeSingle();
            
          if (settings) {
            const userPrefs = settings.value as { theme?: Theme; theme_color?: ThemeColor };
            
            if (userPrefs.theme && (userPrefs.theme === 'light' || userPrefs.theme === 'dark')) {
              setThemeState(userPrefs.theme);
              localStorage.setItem('theme', userPrefs.theme);
              document.documentElement.classList.toggle('dark', userPrefs.theme === 'dark');
            }
            
            if (userPrefs.theme_color && isValidThemeColor(userPrefs.theme_color)) {
              setThemeColorState(userPrefs.theme_color);
              localStorage.setItem('themeColor', userPrefs.theme_color);
              document.documentElement.setAttribute('data-theme-color', userPrefs.theme_color);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
        // Apply defaults on error
        setThemeState(DEFAULT_THEME);
        setThemeColorState(DEFAULT_THEME_COLOR);
      } finally {
        setIsInitializing(false);
      }
    };
    
    loadPreferences();
  }, []);

  // Helper function to validate theme colors
  const isValidThemeColor = (color: string): color is ThemeColor => {
    return ['green', 'blue', 'purple', 'brown', 'teal', 'indigo'].includes(color);
  };

  // Apply theme color variables whenever theme or color changes
  useEffect(() => {
    if (isInitializing) return;
    updateThemeColorVariables(themeColor, theme);
  }, [themeColor, theme, isInitializing]);

  const updateThemeColorVariables = (color: ThemeColor, currentTheme: Theme) => {
    const isDark = currentTheme === 'dark';
    
    // Ensure we have a valid color to prevent the TypeError
    const safeColor = isValidThemeColor(color) ? color : DEFAULT_THEME_COLOR;
    
    // Color HSL values for each theme - using light green as requested
    const colorValues = {
      green: {
        primary: isDark ? '156 47% 50%' : '156 47% 14%',
        secondary: isDark ? '109 34% 42%' : '109 34% 32%',
        accent: '39 100% 61%',
        background: isDark ? '156 47% 5%' : '164 100% 95%', // Light green background #ccfff5
        card: isDark ? '156 47% 10%' : '0 0% 100%',
      },
      blue: {
        primary: isDark ? '210 100% 50%' : '210 100% 25%',
        secondary: isDark ? '210 70% 60%' : '210 70% 40%',
        accent: '35 100% 60%',
        background: isDark ? '210 47% 5%' : '210 48% 21% 0.02',
        card: isDark ? '210 47% 10%' : '0 0% 100%',
      },
      purple: {
        primary: isDark ? '270 50% 50%' : '270 50% 30%',
        secondary: isDark ? '270 30% 60%' : '270 30% 50%',
        accent: '330 100% 70%',
        background: isDark ? '270 47% 5%' : '270 48% 21% 0.02',
        card: isDark ? '270 47% 10%' : '0 0% 100%',
      },
      brown: {
        primary: isDark ? '30 50% 40%' : '30 50% 30%',
        secondary: isDark ? '30 30% 50%' : '30 30% 45%',
        accent: '45 100% 60%',
        background: isDark ? '30 47% 5%' : '30 48% 21% 0.02',
        card: isDark ? '30 47% 10%' : '0 0% 100%',
      },
      teal: {
        primary: isDark ? '180 50% 40%' : '180 50% 25%',
        secondary: isDark ? '180 35% 50%' : '180 35% 40%',
        accent: '150 100% 65%',
        background: isDark ? '180 47% 5%' : '180 48% 21% 0.02',
        card: isDark ? '180 47% 10%' : '0 0% 100%',
      },
      indigo: {
        primary: isDark ? '240 60% 50%' : '240 60% 30%',
        secondary: isDark ? '240 40% 60%' : '240 40% 45%',
        accent: '280 100% 70%',
        background: isDark ? '240 47% 5%' : '240 48% 21% 0.02',
        card: isDark ? '240 47% 10%' : '0 0% 100%',
      },
    };
    
    try {
      // Select the chosen color palette with fallback
      const selectedColors = colorValues[safeColor];
      
      if (!selectedColors) {
        console.warn(`Theme color "${safeColor}" not found in color values. Using default theme.`);
        return;
      }
      
      // Apply the colors to CSS variables
      document.documentElement.style.setProperty('--primary', selectedColors.primary);
      document.documentElement.style.setProperty('--secondary', selectedColors.secondary);
      document.documentElement.style.setProperty('--accent', selectedColors.accent);
      document.documentElement.style.setProperty('--background', selectedColors.background);
      document.documentElement.style.setProperty('--card', selectedColors.card);
      document.documentElement.style.setProperty('--popover', selectedColors.card);
      
      // Update sidebar variables
      document.documentElement.style.setProperty('--sidebar-background', selectedColors.primary);
      document.documentElement.style.setProperty('--sidebar-primary', selectedColors.accent);
      
      // Set data attribute for global theme reference
      document.documentElement.setAttribute('data-theme-color', safeColor);
    } catch (error) {
      console.error('Error applying theme color:', error);
      // Apply default theme color on error
      const defaultColors = colorValues[DEFAULT_THEME_COLOR];
      
      document.documentElement.style.setProperty('--primary', defaultColors.primary);
      document.documentElement.style.setProperty('--secondary', defaultColors.secondary);
      document.documentElement.style.setProperty('--accent', defaultColors.accent);
      document.documentElement.style.setProperty('--background', defaultColors.background);
      document.documentElement.style.setProperty('--card', defaultColors.card);
      document.documentElement.style.setProperty('--popover', defaultColors.card);
      
      document.documentElement.style.setProperty('--sidebar-background', defaultColors.primary);
      document.documentElement.style.setProperty('--sidebar-primary', defaultColors.accent);
      
      document.documentElement.setAttribute('data-theme-color', DEFAULT_THEME_COLOR);
    }
  };

  // Save theme preference
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Update colors for the new theme
    updateThemeColorVariables(themeColor, newTheme);
    
    // Save to database if user is logged in
    try {
      await saveUserPreferences({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Save color preference
  const setThemeColor = async (newColor: ThemeColor) => {
    if (!isValidThemeColor(newColor)) {
      console.warn(`Invalid theme color: ${newColor}. Using default.`);
      newColor = DEFAULT_THEME_COLOR;
    }
    
    setThemeColorState(newColor);
    localStorage.setItem('themeColor', newColor);
    
    // Update colors for the new color
    updateThemeColorVariables(newColor, theme);
    
    // Save to database if user is logged in
    try {
      await saveUserPreferences({ themeColor: newColor });
    } catch (error) {
      console.error('Failed to save color preference:', error);
    }
  };
  
  // Helper to save preferences to database
  const saveUserPreferences = async ({ 
    theme: newTheme, 
    themeColor: newColor 
  }: { 
    theme?: Theme, 
    themeColor?: ThemeColor 
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const userId = session.user.id;
      const settingKey = `user_theme_${userId}`;
      
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();
        
      const updatedValue = {
        ...(existingSetting?.value as object || {}),
        ...(newTheme ? { theme: newTheme } : {}),
        ...(newColor ? { theme_color: newColor } : {})
      };
      
      // Upsert the theme settings
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          key: settingKey,
          value: updatedValue
        });
        
      if (error) throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeColor, setTheme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
