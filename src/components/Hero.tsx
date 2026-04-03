import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ShoppingBag, Phone, ArrowDown, Sparkles, Star, ChevronDown, Sun, Droplets, MapPin } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { sendQuickConsultationRequest } from '../utils/telegram';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  onViewCatalog?: () => void;
}

export function Hero({ onViewCatalog }: HeroProps = {}) {
  const { t, language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const reduceHeavyMotion = prefersReducedMotion || isLowPowerDevice;

  const normalizePhoneInput = (raw: string) => {
    const sanitized = raw.replace(/[^\d+]/g, '');
    const plusCount = (sanitized.match(/\+/g) || []).length;
    if (plusCount > 1) return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    if (sanitized.includes('+') && !sanitized.startsWith('+')) {
      return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    }
    return sanitized.slice(0, 20);
  };

  const formatUzbekPhone = (value: string) => {
    const raw = normalizePhoneInput(value);
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (raw.startsWith('+')) {
      if (!digits.startsWith('998')) digits = `998${digits}`;
      digits = digits.slice(0, 12);
      const cc = digits.slice(0, 3);
      const p1 = digits.slice(3, 5);
      const p2 = digits.slice(5, 8);
      const p3 = digits.slice(8, 10);
      const p4 = digits.slice(10, 12);
      return `+${cc}${p1 ? ` ${p1}` : ''}${p2 ? ` ${p2}` : ''}${p3 ? ` ${p3}` : ''}${p4 ? ` ${p4}` : ''}`;
    }
    return raw;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsLowPowerDevice(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const handleConsultationClick = () => {
    setShowConsultationForm(true);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNext = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await sendQuickConsultationRequest({
        name: formData.name,
        phone: formData.phone,
        message:
          formData.message ||
          pickLang(language, {
            uz: 'Tezkor maslahat so‘rovi',
            ru: 'Запрос быстрой консультации',
            en: 'Quick consultation request',
          })
      });

      if (success) {
        // Успешная отправка
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect border-green-400/20 text-green-400';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = pickLang(language, {
          uz: 'Xabar yuborildi! Tez orada bog\'lanamiz.',
          ru: 'Заявка отправлена! Скоро свяжемся с вами.',
          en: 'Sent! We will contact you shortly.',
        });
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
          }
        }, 4000);

        setFormData({ name: '', phone: '', message: '' });
        setShowConsultationForm(false);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Error sending consultation request:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect border-red-400/20 text-red-400';
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'assertive');
      notification.textContent = pickLang(language, {
        uz: 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
        ru: 'Произошла ошибка. Попробуйте еще раз.',
        en: 'Something went wrong. Please try again.',
      });
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.transform = 'translateX(100%)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Анимированный параллакс фон с эффектами */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: prefersReducedMotion ? '0%' : y }}
        >
          {/* Большие плавающие градиентные сферы */}
          <motion.div
            className="absolute top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 70%)' }}
            animate={reduceHeavyMotion ? undefined : {
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-10 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #F5F3F0 0%, transparent 60%)' }}
            animate={reduceHeavyMotion ? undefined : {
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 50%)' }}
            animate={reduceHeavyMotion ? undefined : {
              x: [0, -50, 0],
              y: [0, 40, 0],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10
            }}
          />
        </motion.div>

        {/* Основной контент */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 text-center"
          style={{ opacity: prefersReducedMotion ? 1 : opacity }}
        >
          <div className="max-w-5xl mx-auto">
            {/* Премиальный заголовок */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}  
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-5"
            >
              <motion.div 
                className="inline-block mb-4 px-4 py-2 glass-effect rounded-full text-xs tracking-wide text-primary border border-primary/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t.heroBadge}
              </motion.div>
              
              <h1 className="text-shadow-modern font-grotesk max-w-4xl mx-auto">
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-balance">
                  {t.heroTitle}
                </span>
                <span className="block text-lg md:text-xl font-normal mt-4 opacity-85 text-balance">
                  {t.heroSubtitle}
                </span>
              </h1>
            </motion.div>

            {/* Премиальное описание */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto text-center mb-5"
            >
              <p className="text-base md:text-lg leading-relaxed mb-5 text-balance opacity-80 max-w-2xl mx-auto">
                {t.heroLead}
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.span
                  whileHover={reduceHeavyMotion ? undefined : { y: -2 }}
                  whileTap={reduceHeavyMotion ? undefined : { scale: 0.98 }}
                  className="trust-pill-interactive flex cursor-default items-center gap-2 rounded-full px-3 py-1.5 border border-primary/15 bg-background/50 backdrop-blur-sm"
                  title={pickLang(language, {
                    uz: 'UV barqarorligi — rang uzoq vaqt ochilmaydi',
                    ru: 'Устойчивость к ультрафиолету — цвет держится дольше',
                    en: 'UV-stable pigments for longer-lasting colour',
                  })}
                >
                  <Sun className="w-4 h-4 text-primary shrink-0" aria-hidden />
                  {t.heroTrustSun}
                </motion.span>
                <motion.span
                  whileHover={reduceHeavyMotion ? undefined : { y: -2 }}
                  whileTap={reduceHeavyMotion ? undefined : { scale: 0.98 }}
                  className="trust-pill-interactive flex cursor-default items-center gap-2 rounded-full px-3 py-1.5 border border-primary/15 bg-background/50 backdrop-blur-sm"
                  title={pickLang(language, {
                    uz: 'Nam va yomg‘irga chidamli — tashqi muhit uchun mos',
                    ru: 'Не боится влаги и дождя — подходит для улицы и террасы',
                    en: 'Moisture-resistant — fine for terraces and outdoor use',
                  })}
                >
                  <Droplets className="w-4 h-4 text-primary shrink-0" aria-hidden />
                  {t.heroTrustWater}
                </motion.span>
                <motion.span
                  whileHover={reduceHeavyMotion ? undefined : { y: -2 }}
                  whileTap={reduceHeavyMotion ? undefined : { scale: 0.98 }}
                  className="trust-pill-interactive flex cursor-default items-center gap-2 rounded-full px-3 py-1.5 border border-primary/15 bg-background/50 backdrop-blur-sm"
                  title={pickLang(language, {
                    uz: 'Ko‘cha, bog‘ va ochiq maydonlar uchun',
                    ru: 'Для улицы, сада и открытых площадок',
                    en: 'Made for streets, gardens and open spaces',
                  })}
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden />
                  {t.heroTrustOutdoor}
                </motion.span>
              </motion.div>
            </motion.div>

            {/* CTA кнопки */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
            >
              <Button
                onClick={onViewCatalog}
                size="lg"
                className="agency-cta-primary h-11 min-w-[220px] px-6 text-sm rounded-lg text-primary-foreground hover:bg-primary/95 micro-interaction shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t.heroCtaBuy}
              </Button>
              
              <Button
                onClick={handleConsultationClick}
                variant="outline"
                size="lg"
                className="h-11 min-w-[220px] px-6 text-sm rounded-lg glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10 micro-interaction"
              >
                <Phone className="w-4 h-4 mr-2" />
                {t.getConsultation}
              </Button>
            </motion.div>

            {/* Статистика с анимацией */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto"
            >
              {[
                { 
                  number: '500+', 
                  label: pickLang(language, {
                    uz: 'Mamnun mijozlar',
                    ru: 'Довольных клиентов',
                    en: 'Happy customers',
                  }),
                },
                { 
                  number: '3+', 
                  label: pickLang(language, {
                    uz: 'Yillik tajriba',
                    ru: 'Года опыта',
                    en: 'Years of craft',
                  }),
                },
                { 
                  number: '100%', 
                  label: pickLang(language, {
                    uz: 'Sifat kafolati',
                    ru: 'Гарантия качества',
                    en: 'Quality focus',
                  }),
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.8 + index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="text-center glass-card p-5 md:p-6 rounded-xl relative overflow-hidden group cursor-pointer border border-primary/10"
                  style={{ transition: "all 0.15s ease-out" }}
                >
                  {/* Эффект свечения при наведении */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-primary mb-1 relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-xs opacity-70 relative z-10">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Кнопка прокрутки с пульсацией */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={scrollToNext}
          aria-label={pickLang(language, {
            uz: 'Keyingi bo\'limga o\'tish',
            ru: 'Прокрутить к следующему разделу',
            en: 'Scroll to next section',
          })}
          className="absolute left-1/2 transform -translate-x-1/2 p-3 rounded-full glass-effect border border-primary/20 hover:border-primary/40 micro-interaction group cursor-pointer"
          style={{ bottom: '17px' }}
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ y: 0, scale: 0.95 }}
        >
          {/* Пульсирующие круги */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={reduceHeavyMotion ? undefined : {
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={reduceHeavyMotion ? undefined : {
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          <motion.div
            className="relative z-10"
            animate={reduceHeavyMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-primary group-hover:text-primary/80" />
          </motion.div>
        </motion.button>
      </section>

      {/* Форма консультации */}
      <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
        <DialogContent className="sm:max-w-md glass-effect border-primary/20">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-2xl text-center">
                <span className="text-gradient">
                  {pickLang(language, {
                    uz: 'Tezkor maslahat',
                    ru: 'Быстрая консультация',
                    en: 'Quick help',
                  })}
                </span>
              </DialogTitle>
              <DialogDescription className="text-center text-base opacity-80">
                {pickLang(language, {
                  uz: 'Ma\'lumotlaringizni qoldiring, biz siz bilan bog\'lanamiz',
                  ru: 'Оставьте свои данные, и мы свяжемся с вами',
                  en: 'Leave your details and we will get back to you',
                })}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitConsultation} className="space-y-6 mt-6" aria-busy={isSubmitting}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="consultation-name" className="sr-only">
                    {pickLang(language, { uz: 'Ismingiz', ru: 'Ваше имя', en: 'Your name' })}
                  </label>
                  <Input
                    id="consultation-name"
                    type="text"
                    placeholder={pickLang(language, { uz: 'Ismingiz', ru: 'Ваше имя', en: 'Your name' })}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="glass-card border-primary/20 h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <label htmlFor="consultation-phone" className="sr-only">
                    {pickLang(language, { uz: 'Telefon raqami', ru: 'Номер телефона', en: 'Phone number' })}
                  </label>
                  <Input
                    id="consultation-phone"
                    type="tel"
                    placeholder={pickLang(language, { uz: 'Telefon raqami', ru: 'Номер телефона', en: 'Phone number' })}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: normalizePhoneInput(e.target.value) }))}
                    onFocus={() => {
                      setFormData((prev) => ({
                        ...prev,
                        phone: prev.phone.trim() ? prev.phone : '+998 ',
                      }));
                    }}
                    onBlur={(e) => setFormData(prev => ({ ...prev, phone: formatUzbekPhone(e.target.value).trim() }))}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    pattern="^\+?[0-9\s\-()]{9,20}$"
                    minLength={9}
                    title={pickLang(language, {
                      uz: 'To\'g\'ri telefon raqamini kiriting',
                      ru: 'Введите корректный номер телефона',
                      en: 'Enter a valid phone number',
                    })}
                    disabled={isSubmitting}
                    className="glass-card border-primary/20 h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <label htmlFor="consultation-message" className="sr-only">
                    {pickLang(language, {
                      uz: 'Qo\'shimcha xabar',
                      ru: 'Дополнительное сообщение',
                      en: 'Optional message',
                    })}
                  </label>
                  <Textarea
                    id="consultation-message"
                    placeholder={pickLang(language, {
                      uz: 'Qo\'shimcha xabar (ixtiyoriy)',
                      ru: 'Дополнительное сообщение (необязательно)',
                      en: 'Optional message',
                    })}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="glass-card border-primary/20 rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConsultationForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl glass-card border-primary/20 hover:border-primary/40 micro-interaction"
                >
                  {pickLang(language, { uz: 'Bekor qilish', ru: 'Отмена', en: 'Cancel' })}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.phone}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="sr-only">
                        {pickLang(language, { uz: 'Yuborilmoqda...', ru: 'Отправка...', en: 'Sending...' })}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      {t.send}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}