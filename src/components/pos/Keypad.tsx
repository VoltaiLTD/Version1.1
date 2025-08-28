import React from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { Card } from '../ui/Card';

interface KeypadProps {
  onInput: (value: string) => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onInput }) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace']
  ];

  const handleKeyPress = (key: string) => {
    onInput(key);
  };

  const getKeyContent = (key: string) => {
    switch (key) {
      case 'clear':
        return 'Clear';
      case 'backspace':
        return <Delete className="h-5 w-5" />;
      default:
        return key;
    }
  };

  const getKeyVariant = (key: string) => {
    if (key === 'clear') return 'bg-error-500 hover:bg-error-600 text-white';
    if (key === 'backspace') return 'bg-warning-500 hover:bg-warning-600 text-white';
    return 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200';
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-center">Enter Amount</h2>
      
      <div className="grid grid-cols-3 gap-3">
        {keys.flat().map((key, index) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleKeyPress(key)}
            className={`
              h-16 rounded-lg font-semibold text-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${getKeyVariant(key)}
              ${key === 'clear' ? 'col-span-1' : ''}
              ${key === '0' ? 'col-span-1' : ''}
              ${key === 'backspace' ? 'col-span-1' : ''}
            `}
          >
            {getKeyContent(key)}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-neutral-500">
        <p>Tap numbers to enter amount</p>
        <p className="mt-1">
          <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">Clear</kbd> to reset • 
          <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs ml-1">⌫</kbd> to delete
        </p>
      </div>
    </Card>
  );
};