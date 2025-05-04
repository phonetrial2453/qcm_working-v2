
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ThemeSettings: React.FC = () => {
  const { theme, themeColor, setTheme, setThemeColor } = useTheme();

  const colorOptions = [
    { id: 'green', name: 'Green', bgClass: 'bg-green-500' },
    { id: 'blue', name: 'Blue', bgClass: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', bgClass: 'bg-purple-800' },
    { id: 'brown', name: 'Brown', bgClass: 'bg-amber-800' },
    { id: 'teal', name: 'Teal', bgClass: 'bg-teal-700' },
    { id: 'indigo', name: 'Indigo', bgClass: 'bg-indigo-700' },
  ];

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
        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="mode">Display Mode</TabsTrigger>
            <TabsTrigger value="colors">Theme Colors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mode" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex-1 flex flex-col items-center justify-center p-6 h-auto gap-2"
              >
                <Sun className="h-6 w-6" />
                <span>Light Mode</span>
              </Button>
              
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex-1 flex flex-col items-center justify-center p-6 h-auto gap-2"
              >
                <Moon className="h-6 w-6" />
                <span>Dark Mode</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <Button
                  key={color.id}
                  variant="outline"
                  onClick={() => setThemeColor(color.id as any)}
                  className={`
                    relative flex flex-col items-center justify-center p-6 h-auto
                    ${themeColor === color.id ? 'ring-2 ring-primary' : ''}
                    transition-all duration-200
                  `}
                >
                  {themeColor === color.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                  )}
                  <div className={`w-8 h-8 rounded-full ${color.bgClass} mb-2`} />
                  <span>{color.name}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
