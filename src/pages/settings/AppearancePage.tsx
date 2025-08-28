import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Monitor, Sun, Moon, Zap, Eye } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useThemeStore, Theme, Density } from '../../lib/store/useThemeStore';

export const AppearancePage: React.FC = () => {
  const {
    theme,
    density,
    reduceMotion,
    setTheme,
    setDensity,
    setReduceMotion,
    getEffectiveTheme
  } = useThemeStore();

  const themeOptions: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const densityOptions: { value: Density; label: string; description: string }[] = [
    { value: 'compact', label: 'Compact', description: 'More content, less spacing' },
    { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
    { value: 'spacious', label: 'Spacious', description: 'More spacing, easier to read' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800">Appearance</h1>
          <p className="text-neutral-600 mt-2">Customize how Volt AI looks and feels</p>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Theme
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-full
                        ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.value === 'system' && (
                          <div className="text-sm text-neutral-500">
                            Currently: {getEffectiveTheme()}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Density Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Density
            </h2>
            
            <div className="space-y-3">
              {densityOptions.map((option) => {
                const isSelected = density === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setDensity(option.value)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-neutral-500">{option.description}</div>
                      </div>
                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-primary-500"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Accessibility */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Accessibility
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-neutral-800">Reduce Motion</h3>
                  <p className="text-sm text-neutral-600">
                    Minimize animations and transitions for better accessibility
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-6">Preview</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h3 className="font-semibold mb-2">Sample Card</h3>
                <p className="text-neutral-600 mb-4">
                  This is how cards and content will appear with your current settings.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm">Primary Button</Button>
                  <Button variant="outline" size="sm">Secondary Button</Button>
                </div>
              </div>
              
              <div className="text-sm text-neutral-500">
                <p>Current settings:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Theme: {theme} ({getEffectiveTheme()})</li>
                  <li>Density: {density}</li>
                  <li>Reduce motion: {reduceMotion ? 'enabled' : 'disabled'}</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};