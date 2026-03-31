import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, ShoppingCart, Globe, X, Sparkles } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { LanguageToggle } from './LanguageToggle';
import logoImage from 'figma:asset/fae59665fd1772cdd61f6a4d1c95ed996e1502f5.png';

interface HeaderProps {
  cartItems: number;
  onCartClick: () => void;
  currentPage: 'home' | 'catalog' | 'admin';
  onNavigate: (page: 'home' | 'catalog' | 'admin') => void;
  onLogoSecretAccess?: (e: React.MouseEvent | React.TouchEvent) => void;
  onLogoLongPress?: () => void;
  isAdminMode?: boolean;
}

export const Header = memo(function Header({ 
  cartItems, 
  onCartClick, 
  currentPage, 
  onNavigate, 
  onLogoSecretAccess,
  onLogoLongPress,
  isAdminMode = false 
}: HeaderProps) {
  const { t, language } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Вызываем сразу при монтировании
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (page: 'home' | 'catalog' | 'admin') => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLongPressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      if (onLogoLongPress) {
        onLogoLongPress();
        setIsLongPressing(false);
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }, 3000);
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const primaryMenuItems = [
    { name: t.about, id: 'about' },
    { name: t.catalog, id: 'catalog', isPage: true },
    { name: t.projectGallery, id: 'gallery' },
    { name: t.contacts, id: 'contacts' }
  ];

  const secondaryMenuItems = [
    { name: t.whyUsTitle, id: 'why-us' },
    { name: 'Проекты', id: 'gallery' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Отзывы', id: 'reviews' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'glass-effect border-b border-primary/20 shadow-lg shadow-black/10' 
          : 'bg-transparent border-b border-transparent'
      } ${isAdminMode ? 'border-b-red-400/30' : ''}`}
      style={{ 
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={(e) => {
              if (!e.shiftKey) {
                handleNavigation('home');
              }
              if (onLogoSecretAccess) {
                onLogoSecretAccess(e);
              }
            }}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            className={`flex items-center gap-3 relative ${
              isAdminMode ? 'ring-2 ring-red-400/50 rounded-xl px-3 py-2' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title={isAdminMode ? "🔐 Админ-режим активен" : "Главная (Shift+Click для админ-панели)"}
          >
            {/* Индикатор долгого удержания */}
            {isLongPressing && (
              <motion.div
                className="absolute inset-0 bg-red-400/20 rounded-xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3 }}
              />
            )}
            
            <div className="relative">
              <motion.div 
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center overflow-hidden"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src={logoImage} 
                  alt="Bententrade Logo" 
                  className="w-8 h-8 object-contain filter brightness-110"
                />
              </motion.div>
              
              {isAdminMode && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gradient">
                Bententrade
              </span>
              <span className="text-xs opacity-60">
                {language === 'uz' ? 'Premium sifat' : 'Премиум качество'}
              </span>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {primaryMenuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if (item.isPage) {
                    // Безопасная навигация только к известным страницам
                    if (item.id === 'catalog') {
                      handleNavigation('catalog');
                    } else if (item.id === 'admin') {
                      handleNavigation('admin');
                    } else {
                      handleNavigation('home');
                    }
                  } else {
                    scrollToSection(item.id);
                  }
                }}
                className="text-base font-medium px-4 py-2 h-auto rounded-xl hover-glass-nav micro-interaction group"
              >
                <span className="group-hover:text-gradient transition-all duration-300">
                  {item.name}
                </span>
              </Button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Cart Button */}
            <Button
              onClick={onCartClick}
              variant="outline"
              size="sm"
              className="relative h-11 px-4 rounded-xl glass-card border-primary/20 hover:border-primary/40 micro-interaction"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge 
                    variant="destructive" 
                    className="min-w-6 h-6 text-xs rounded-full bg-primary text-primary-foreground px-2"
                  >
                    {cartItems}
                  </Badge>
                </motion.div>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden h-11 px-3 rounded-xl glass-card border-primary/20 hover:border-primary/40"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className="w-80 glass-effect border-l border-primary/20 p-0"
              >
                <motion.div
                  initial={{ x: 300 }}
                  animate={{ x: 0 }}
                  exit={{ x: 300 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-gradient">Меню</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 p-6 space-y-6">
                    {/* Primary Menu */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium opacity-60 mb-3">Основное меню</h3>
                      {primaryMenuItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => item.isPage ? handleNavigation(item.id as 'catalog') : scrollToSection(item.id)}
                            className="w-full justify-start text-base p-4 h-auto rounded-xl hover:bg-primary/10 micro-interaction"
                          >
                            {item.name}
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Secondary Menu */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium opacity-60 mb-3">Дополнительно</h3>
                      {secondaryMenuItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (primaryMenuItems.length + index) * 0.1 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => scrollToSection(item.id)}
                            className="w-full justify-start text-base p-4 h-auto rounded-xl hover:bg-primary/10 micro-interaction"
                          >
                            {item.name}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-primary/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-60">Язык</span>
                      <LanguageToggle />
                    </div>
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});