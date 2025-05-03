
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';

const themeColors = [
  { id: 'green', name: 'Green', bgClass: 'bg-islamic-primary' },
  { id: 'blue', name: 'Blue', bgClass: 'bg-islamic-blue' },
  { id: 'purple', name: 'Purple', bgClass: 'bg-purple-800' },
  { id: 'brown', name: 'Brown', bgClass: 'bg-amber-800' },
  { id: 'teal', name: 'Teal', bgClass: 'bg-teal-700' },
  { id: 'indigo', name: 'Indigo', bgClass: 'bg-indigo-700' },
];

const ThemeSettings: React.FC = () => {
  const { theme, themeColor, setTheme, setThemeColor } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Display Mode</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Theme Colors</Label>
            <RadioGroup 
              value={themeColor} 
              onValueChange={(value) => setThemeColor(value as any)}
              className="flex flex-wrap gap-4"
            >
              {themeColors.map((color) => (
                <div key={color.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={color.id} 
                    id={`color-${color.id}`} 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={`color-${color.id}`}
                    className={`
                      flex items-center space-x-2 rounded-md border-2 px-4 py-3
                      ${themeColor === color.id ? 'border-primary' : 'border-transparent'}
                      hover:bg-accent hover:text-accent-foreground cursor-pointer
                      transition-all duration-200
                    `}
                  >
                    <div className={`w-5 h-5 rounded-full ${color.bgClass}`} />
                    <span>{color.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
