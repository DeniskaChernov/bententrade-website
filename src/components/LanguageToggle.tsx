import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useLanguage } from '../utils/language-context';
import { Globe } from '../utils/lucide-stub';
import { useState } from 'react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'uz' as const, name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-10 px-3 text-sm font-medium hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="ml-1 hidden md:inline">{currentLanguage?.name}</span>
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-200 text-left hover:bg-gray-100 ${
                    language === lang.code
                      ? 'bg-amber-50 text-amber-900 font-medium'
                      : 'text-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-amber-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}