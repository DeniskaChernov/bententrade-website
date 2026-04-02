import { useState, useEffect, Suspense, lazy, useCallback, useMemo, startTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from './components/ui/sonner';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
import { LanguageProvider } from './utils/language-context';
import { SEOHead } from './components/SEOHead';
import { StructuredData } from './components/StructuredData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Cart } from './components/Cart';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { LegalDocuments, LegalDocumentType } from './components/LegalDocuments';
import { TelegramQuickFixWizard } from './components/TelegramQuickFixWizard';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Lock, Shield, AlertCircle, Sparkles } from './utils/lucide-stub';
import { API_BASE_URL, API_TOKEN } from './utils/env';
import { getBlogPostBySlug } from './data/blogPosts';

// Optimized lazy loading with shorter timeout and retry mechanism
const Gallery = lazy(() => 
  import('./components/Gallery')
    .then(module => ({ default: module.Gallery }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Галерея временно недоступна</div> }))
);
const Trend2025 = lazy(() => 
  import('./components/Trend2025')
    .then(module => ({ default: module.Trend2025 }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Раздел временно недоступен</div> }))
);
const CatalogPage = lazy(() => 
  import('./components/CatalogPage')
    .then(module => ({ default: module.CatalogPage }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Каталог временно недоступен</div> }))
);
const AdminPanel = lazy(() => 
  import('./components/admin/AdminPanel')
    .then(module => ({ default: module.default }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Админ-панель временно недоступна</div> }))
);
const About = lazy(() => import('./components/About').then(module => ({ default: module.About })));
const MiniCatalog = lazy(() => import('./components/MiniCatalog').then(module => ({ default: module.MiniCatalog })));
const WhyUs = lazy(() => import('./components/WhyUs').then(module => ({ default: module.WhyUs })));
const FAQ = lazy(() => import('./components/FAQ').then(module => ({ default: module.FAQ })));
const Reviews = lazy(() => import('./components/Reviews').then(module => ({ default: module.Reviews })));
const Contacts = lazy(() => import('./components/Contacts').then(module => ({ default: module.Contacts })));
const BlogSection = lazy(() => import('./components/BlogSection').then(module => ({ default: module.BlogSection })));
const BlogPostPage = lazy(() => import('./components/BlogPostPage').then(module => ({ default: module.BlogPostPage })));
const BlogListPage = lazy(() => import('./components/BlogListPage').then(module => ({ default: module.BlogListPage })));
const SEOContent = lazy(() => import('./components/SEOContent').then(module => ({ default: module.SEOContent })));
const HomeSEOClusters = lazy(() => import('./components/HomeSEOClusters').then(module => ({ default: module.HomeSEOClusters })));

interface ColorVariant {
  id: string;
  name: string;
  image: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  selectedVariant?: ColorVariant;
  selectedImageIndex?: number;
  size?: string;
  style?: string;
  category?: string; // 'materials' для ротанга, иначе кашпо
}

interface CartItem extends Product {
  quantity: number;
}

// Современный компонент для админ-логина
function ModernAdminLogin({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 30000;

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect ${
      type === 'success' 
        ? 'border-green-400/20 text-green-400' 
        : 'border-red-400/20 text-red-400'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      showNotification('Вход заблокирован. Попробуйте позже.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'X-Admin-Password': password,
        },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Неверный пароль');
      }

      showNotification('Добро пожаловать в админ-панель! ✨', 'success');
      setPassword('');
      setAttempts(0);
      setIsLoading(false);
      onLogin(password);
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setIsLoading(false);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        showNotification(`Превышено количество попыток. Доступ заблокирован на ${LOCKOUT_TIME / 1000} секунд.`);
        
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
        }, LOCKOUT_TIME);
      } else {
        showNotification(`Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
      }
      
      setPassword('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword('');
      setAttempts(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md glass-effect border-primary/20">
            <DialogHeader className="space-y-4">
              <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-2 rounded-full bg-primary/10"
                >
                  <Shield className="w-6 h-6 text-primary" />
                </motion.div>
                <span className="text-gradient">Админ-панель</span>
              </DialogTitle>
              <DialogDescription className="text-center text-base opacity-80">
                Введите пароль для доступа к панели управления
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >

              <div className="space-y-6">
                <motion.div 
                  className="flex items-center gap-3 p-4 glass-card rounded-xl border-amber-400/20"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-amber-400/90">Доступ только для авторизованного персонала</span>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div 
                    className="space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="admin-password" className="text-sm font-medium text-foreground/90">
                      Пароль администратора
                    </label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Введите пароль..."
                      disabled={isLoading || isLocked}
                      autoComplete="current-password"
                      className="glass-card border-primary/20 text-base h-12 rounded-xl"
                    />
                  </motion.div>

                  {attempts > 0 && !isLocked && (
                    <motion.div 
                      className="flex items-center gap-3 text-sm text-orange-400"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Неверных попыток: {attempts} из {MAX_ATTEMPTS}</span>
                    </motion.div>
                  )}

                  {isLocked && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 glass-card border-red-400/20 rounded-xl text-sm text-red-400"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Вход временно заблокирован</span>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 h-12 rounded-xl glass-card border-primary/20 hover:border-primary/40 micro-interaction"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={!password || isLoading || isLocked}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Войти
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <motion.div 
                  className="text-xs text-center opacity-60 border-t border-primary/10 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  Проверка пароля выполняется на сервере Railway
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'admin' | 'legal' | 'blog'>('home');
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [currentLegalDocument, setCurrentLegalDocument] = useState<LegalDocumentType | null>(null);
  const [showTelegramHelper, setShowTelegramHelper] = useState(false);
  const [telegramError, setTelegramError] = useState<any>(null);
  const [shouldRenderTrend, setShouldRenderTrend] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const trendTriggerRef = useRef<HTMLDivElement | null>(null);

  const legalFromPath = useCallback((path: string): LegalDocumentType | null => {
    const legacyMap: Record<string, LegalDocumentType> = {
      '/privacy': 'privacy',
      '/cookies': 'cookies',
      '/terms': 'terms',
      '/company': 'company',
    };
    if (legacyMap[path]) return legacyMap[path];
    if (path.startsWith('/legal/')) {
      const slug = path.replace('/legal/', '');
      if (slug === 'privacy' || slug === 'cookies' || slug === 'terms' || slug === 'company') {
        return slug;
      }
    }
    return null;
  }, []);

  const blogFromPath = useCallback((path: string): string | null => {
    if (path === '/blog') return '__list__';
    if (!path.startsWith('/blog/')) return null;
    const slug = path.replace('/blog/', '');
    if (!slug) return null;
    return slug;
  }, []);

  const updateUrl = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, []);

  // ✅ Обработка начальной навигации по URL (для SEO и прямых ссылок)
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/catalog') {
      startTransition(() => setCurrentPage('catalog'));
    } else if (path === '/admin') {
      startTransition(() => setCurrentPage('admin'));
    } else if (path === '/legal') {
      startTransition(() => {
        setCurrentLegalDocument('privacy');
        setCurrentPage('legal');
      });
    } else {
      const blogSlug = blogFromPath(path);
      if (blogSlug) {
        startTransition(() => {
          setCurrentPage('blog');
          setCurrentBlogSlug(blogSlug === '__list__' ? null : blogSlug);
          setCurrentLegalDocument(null);
        });
        return;
      }

      const legalType = legalFromPath(path);
      if (legalType) {
        startTransition(() => {
          setCurrentLegalDocument(legalType);
          setCurrentPage('legal');
        });
      }
    }
  }, [blogFromPath, legalFromPath]);

  // Синхронизация SPA состояния с back/forward браузера.
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (path === '/catalog') {
        setCurrentPage('catalog');
        setCurrentLegalDocument(null);
        return;
      }
      if (path === '/admin') {
        setCurrentPage('admin');
        return;
      }
      if (path === '/legal') {
        setCurrentPage('legal');
        setCurrentLegalDocument('privacy');
        return;
      }
      const legalType = legalFromPath(path);
      if (legalType) {
        setCurrentPage('legal');
        setCurrentLegalDocument(legalType);
        setCurrentBlogSlug(null);
        return;
      }
      const blogSlug = blogFromPath(path);
      if (blogSlug) {
        setCurrentPage('blog');
        setCurrentBlogSlug(blogSlug === '__list__' ? null : blogSlug);
        setCurrentLegalDocument(null);
        return;
      }
      setCurrentPage('home');
      setCurrentLegalDocument(null);
      setCurrentBlogSlug(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [blogFromPath, legalFromPath]);

  useEffect(() => {
    if (currentPage !== 'home' || shouldRenderTrend || !trendTriggerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRenderTrend(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(trendTriggerRef.current);
    return () => observer.disconnect();
  }, [currentPage, shouldRenderTrend]);

  // ✅ SEO теги управляются компонентом <SEOHead /> - НЕ дублируем здесь!
  // Удалён дублирующий useEffect для мета-тегов

  const handleExitAdmin = useCallback(() => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    setAdminPassword('');
    setCurrentPage('home');
    updateUrl('/');
  }, [updateUrl]);

  // Скрытые способы доступа к админ-панели
  useEffect(() => {
    const handleKeyboardAccess = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminLogin(true);
      }
      
      // Горячая клавиша для Telegram Helper: Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTelegramHelper(true);
      }
      
      if (e.key === 'Escape' && isAdminMode) {
        handleExitAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyboardAccess);
    return () => window.removeEventListener('keydown', handleKeyboardAccess);
  }, [isAdminMode, handleExitAdmin]);

  // Обработчик событий Telegram ошибок
  useEffect(() => {
    const handleTelegramSetup = (event: any) => {
      console.log('📥 Opening Telegram Setup Helper', event.detail);
      setTelegramError(event.detail?.error);
      setShowTelegramHelper(true);
    };

    window.addEventListener('openTelegramSetup' as any, handleTelegramSetup);
    return () => window.removeEventListener('openTelegramSetup' as any, handleTelegramSetup);
  }, []);

  const cartItemsCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]
  );

  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const itemId = product.selectedVariant 
        ? `${product.id}-${product.selectedVariant.id}-${product.selectedImageIndex || 0}` 
        : product.id;
      
      const existingItem = prev.find(item => {
        const existingItemId = item.selectedVariant 
          ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}` 
          : item.id;
        return existingItemId === itemId;
      });

      // Для ротанга (materials) шаг увеличения 5кг, для кашпо - 1шт
      const isRattan = product.category === 'materials';
      const incrementStep = isRattan ? 5 : 1;
      const initialQuantity = isRattan ? 5 : 1;

      if (existingItem) {
        return prev.map(item => {
          const existingItemId = item.selectedVariant 
            ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}` 
            : item.id;
          return existingItemId === itemId
            ? { ...item, quantity: item.quantity + incrementStep }
            : item;
        });
      }
      return [...prev, { ...product, quantity: initialQuantity }];
    });
    setIsCartOpen(true);
    setCartFeedback(product.name);
    window.setTimeout(() => setCartFeedback(null), 1800);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item => {
        const itemId = item.selectedVariant 
          ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}` 
          : item.id;
        return itemId === id ? { ...item, quantity } : item;
      })
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => {
      const itemId = item.selectedVariant 
        ? `${item.id}-${item.selectedVariant.id}-${item.selectedImageIndex || 0}` 
        : item.id;
      return itemId !== id;
    }));
  }, []);

  const handleNavigate = useCallback((page: 'home' | 'catalog' | 'admin' | 'blog') => {
    if (page === 'blog') {
      startTransition(() => {
        setCurrentPage('blog');
        setCurrentBlogSlug(null);
        setCurrentLegalDocument(null);
      });
      updateUrl('/blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    startTransition(() => {
      setCurrentPage(page);
      setCurrentBlogSlug(null);
      setCurrentLegalDocument(null);
    });
    updateUrl(page === 'catalog' ? '/catalog' : page === 'admin' ? '/admin' : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleLogoSecretAccess = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('shiftKey' in e && e.shiftKey) {
      e.preventDefault();
      setShowAdminLogin(true);
      return;
    }
  }, []);

  const handleLogoLongPress = useCallback(() => {
    setShowAdminLogin(true);
  }, []);

  const handleAdminLogin = useCallback((password: string) => {
    setAdminPassword(password);
    setIsAuthenticated(true);
    setIsAdminMode(true);
    setShowAdminLogin(false);
    setCurrentPage('admin');
    updateUrl('/admin');
  }, [updateUrl]);

  const handleCartClick = useCallback(() => setIsCartOpen(true), []);
  const handleCartClose = useCallback(() => setIsCartOpen(false), []);

  const handleLegalDocumentClick = useCallback((type: LegalDocumentType) => {
    startTransition(() => {
      setCurrentLegalDocument(type);
      setCurrentPage('legal');
    });
    updateUrl(`/legal/${type}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleBackFromLegal = useCallback(() => {
    startTransition(() => {
      setCurrentPage('home');
      setCurrentLegalDocument(null);
    });
    updateUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleViewPrivacyPolicy = useCallback(() => {
    handleLegalDocumentClick('privacy');
  }, [handleLegalDocumentClick]);

  const handleOpenBlogPost = useCallback((slug: string) => {
    startTransition(() => {
      setCurrentPage('blog');
      setCurrentBlogSlug(slug);
      setCurrentLegalDocument(null);
    });
    updateUrl(`/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleOpenBlogList = useCallback(() => {
    startTransition(() => {
      setCurrentPage('blog');
      setCurrentBlogSlug(null);
      setCurrentLegalDocument(null);
    });
    updateUrl('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleBackFromBlog = useCallback(() => {
    startTransition(() => {
      setCurrentPage('home');
      setCurrentBlogSlug(null);
    });
    updateUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  // Оптимизированный фон с упрощенными эффектами
  const ModernBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Основной градиент */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Упрощенные статичные эффекты */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 70%)' }}
      />
      
      <div 
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #F5F3F0 0%, transparent 60%)' }}
      />
      
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-6"
        style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 50%)' }}
      />
    </div>
  );

  const LazyLoadError = ({ error }: { error?: Error }) => (
    <div className="flex items-center justify-center min-h-96 p-8">
      <div className="text-center glass-card p-8 rounded-2xl max-w-md">
        <p className="text-muted-foreground mb-2">Компонент временно недоступен</p>
        <p className="text-xs text-muted-foreground/60 mb-4">
          {error?.message || 'Попробуйте обновить страницу'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="micro-interaction"
          size="sm"
        >
          Обновить страницу
        </Button>
      </div>
    </div>
  );

  // Админ-панель
  if (currentPage === 'admin' && isAuthenticated) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <Header 
            cartItems={cartItemsCount} 
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <motion.div 
              className="fixed top-0 left-0 right-0 glass-effect border-b border-red-400/20 text-red-400 text-center py-2 text-sm z-50"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Режим администратора | Нажмите ESC для выхода
              </div>
            </motion.div>
            
            <div className="pt-16 relative z-10">
              <Suspense fallback={
                <div className="container mx-auto px-4 py-16">
                  <LoadingSpinner size="lg" text="Загрузка админ-панели..." />
                </div>
              }>
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <AdminPanel onExit={handleExitAdmin} adminPassword={adminPassword} />
                </ErrorBoundary>
              </Suspense>
            </div>
            
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница каталога
  if (currentPage === 'catalog') {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="catalog" />
          <StructuredData type="catalog" />
          
          <Header 
            cartItems={cartItemsCount} 
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <main className="pt-20 relative z-10">
              <h1 className="sr-only">Каталог Bententrade: ротанговая нить и плетеные кашпо</h1>
              <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                  <LoadingSpinner size="lg" text="Загрузка каталога..." />
                </div>
              }>
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <CatalogPage 
                    onAddToCart={addToCart}
                    onBackToHome={() => handleNavigate('home')}
                  />
                </ErrorBoundary>
              </Suspense>
            </main>

            <Cart
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />

            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница юридических документов
  if (currentPage === 'legal' && currentLegalDocument) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="legal" />
          <StructuredData type="home" />
          
          <Header 
            cartItems={cartItemsCount} 
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <main className="relative z-10">
              <h1 className="sr-only">Юридическая информация Bententrade</h1>
              <LegalDocuments 
                type={currentLegalDocument}
                onBack={handleBackFromLegal}
              />
            </main>

            <Cart
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />

            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница публикации блога
  if (currentPage === 'blog' && currentBlogSlug) {
    const post = getBlogPostBySlug(currentBlogSlug);
    const blogTitle = post ? post.title.ru : 'Блог Bententrade';
    const blogDescription = post ? post.description.ru : 'Новости и статьи Bententrade';
    const canonicalBlogUrl = `https://bententrade.uz/blog/${currentBlogSlug}`;
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead
            page="blog"
            title={blogTitle}
            description={blogDescription}
            canonicalUrl={canonicalBlogUrl}
            image={post?.image}
          />
          <StructuredData type="home" />
          <Header 
            cartItems={cartItemsCount} 
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
                <BlogPostPage slug={currentBlogSlug} onBack={handleBackFromBlog} />
              </Suspense>
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <Cart
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (currentPage === 'blog' && !currentBlogSlug) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="blog" canonicalUrl="https://bententrade.uz/blog" />
          <StructuredData type="home" />
          <Header 
            cartItems={cartItemsCount} 
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
                <BlogListPage onBack={handleBackFromBlog} onOpenPost={handleOpenBlogPost} />
              </Suspense>
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <Cart
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Главная страница
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <SEOHead page="home" />
        <StructuredData type="home" />
        
        <Header 
          cartItems={cartItemsCount} 
          onCartClick={handleCartClick}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogoSecretAccess={handleLogoSecretAccess}
          onLogoLongPress={handleLogoLongPress}
          isAdminMode={isAdminMode}
        />
        
        <div className="min-h-screen">
          <ModernBackground />
          
          <main className="relative z-10">
            <Hero onViewCatalog={() => handleNavigate('catalog')} />
            <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
              <About />
            </Suspense>
            
            <div ref={trendTriggerRef} className="h-2 w-full" aria-hidden="true" />
            {shouldRenderTrend ? (
              <Suspense fallback={
                <section className="py-24">
                  <div className="container mx-auto px-4">
                    <LoadingSpinner text="Загрузка тренда 2025..." />
                  </div>
                </section>
              }>
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <Trend2025 />
                </ErrorBoundary>
              </Suspense>
            ) : (
              <section className="py-12" aria-hidden="true" />
            )}

            <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
              <MiniCatalog 
                onAddToCart={addToCart} 
                onViewFullCatalog={() => handleNavigate('catalog')}
              />
            </Suspense>
            
            {/* SEO-оптимизированные секции грузятся отложенно */}
            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <SEOContent />
            </Suspense>
            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <HomeSEOClusters />
            </Suspense>
            
            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <WhyUs />
            </Suspense>
            
            <Suspense fallback={
              <section className="py-24">
                <div className="container mx-auto px-4">
                  <LoadingSpinner text="Загрузка галереи..." />
                </div>
              </section>
            }>
              <ErrorBoundary fallback={<LazyLoadError />}>
                <Gallery />
              </ErrorBoundary>
            </Suspense>

            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <BlogSection onOpenPost={handleOpenBlogPost} />
            </Suspense>
            <div className="text-center pb-8">
              <Button variant="outline" onClick={handleOpenBlogList} className="glass-card border-primary/20 hover:border-primary/40">
                Все статьи блога
              </Button>
            </div>

            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <FAQ />
            </Suspense>
            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <Reviews />
            </Suspense>
            <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
              <Contacts />
            </Suspense>
          </main>

          <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />

          <Cart
            isOpen={isCartOpen}
            onClose={handleCartClose}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
          />

          <CookieBanner onViewPrivacyPolicy={handleViewPrivacyPolicy} />

          <ModernAdminLogin
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
          />

          <TelegramQuickFixWizard
            isOpen={showTelegramHelper}
            onClose={() => setShowTelegramHelper(false)}
            error={telegramError}
          />

          <ScrollToTop />
          <Toaster />
          <AnimatePresence>
            {cartFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-xl glass-effect border border-primary/30 text-sm shadow-lg"
                role="status"
                aria-live="polite"
              >
                Товар добавлен в корзину: {cartFeedback}
              </motion.div>
            )}
          </AnimatePresence>
          
          {isAdminMode && (
            <motion.div 
              className="fixed bottom-4 right-4 w-3 h-3 bg-red-400 rounded-full opacity-50 pointer-events-none neon-glow"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </ErrorBoundary>
    </LanguageProvider>
  );
}