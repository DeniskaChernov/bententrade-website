import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ShoppingBag, Phone, ArrowDown, Sparkles, Star, ChevronDown } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { sendQuickConsultationRequest } from '../utils/telegram';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  onViewCatalog?: () => void;
}

export function Hero({ onViewCatalog }: HeroProps = {}) {
  const { t, language } = useLanguage();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleConsultationClick = () => {
    setShowConsultationForm(true);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('mini-catalog');
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
        message: formData.message || 'Запрос быстрой консультации'
      });

      if (success) {
        // Успешная отправка
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect border-green-400/20 text-green-400';
        notification.textContent = language === 'uz' 
          ? 'Xabar yuborildi! Tez orada bog\'lanamiz.'
          : 'Заявка отправлена! Скоро свяжемся с вами.';
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
      notification.textContent = language === 'uz' 
        ? 'Xatolik yuz berdi. Qayta urinib ko\'ring.'
        : 'Произошла ошибка. Попробуйте еще раз.';
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
          style={{ y }}
        >
          {/* Большие плавающие градиентные сферы */}
          <motion.div
            className="absolute top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #D4A574 0%, transparent 70%)' }}
            animate={{
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
            animate={{
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
            animate={{
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
          style={{ opacity }}
        >
          <div className="max-w-5xl mx-auto">
            {/* Премиальный заголовок */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}  
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-6"
            >
              <motion.div 
                className="inline-block mb-5 px-5 py-2 glass-effect rounded-full text-xs tracking-wide text-primary border border-primary/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {language === 'uz' ? 'Handmade Luxury Collection' : 'Handmade Luxury Collection'}
              </motion.div>
              
              <h1 className="text-shadow-modern font-grotesk">
                <span className="block text-gradient mb-2 text-lg md:text-xl">
                  {language === 'uz' ? 'Ekskluziv' : 'Эксклюзивные'}
                </span>
                <span className="block text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none">
                  {language === 'uz' ? 'RATTAN' : 'РОТАНГ'}
                </span>
                <span className="block text-lg md:text-xl font-light mt-3 opacity-75">
                  {language === 'uz' ? 'kashpo va aksessuarlar' : 'кашпо и аксессуары'}
                </span>
              </h1>
            </motion.div>

            {/* Премиальное описание */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto text-center mb-6"
            >
              <p className="text-base md:text-lg leading-relaxed mb-6 text-balance opacity-80">
                {language === 'uz' 
                  ? 'Zamonaviy dizayn va an\'anaviy hunarmandchilik uyg\'unligi. Har bir mahsulot – bu sizning makoning uchun san\'at asari.'
                  : 'Слияние современного дизайна и традиционного мастерства. Каждое изделие — произведение искусства для вашего пространства.'
                }
              </p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {language === 'uz' ? 'Qo\'lda tayyorlangan' : 'Ручная работа'}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {language === 'uz' ? 'Premium materiallar' : 'Премиум материалы'}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                  {language === 'uz' ? '24/7 qo\'llab-quvvatlash' : 'Поддержка 24/7'}
                </span>
              </motion.div>
            </motion.div>

            {/* CTA кнопки */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12"
            >
              <Button
                onClick={onViewCatalog}
                size="lg"
                className="h-11 px-6 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {language === 'uz' ? 'Mahsulotlarni ko\'rish' : 'Смотреть товары'}
              </Button>
              
              <Button
                onClick={() => window.location.href = 'tel:+998771044422'}
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm rounded-lg glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10 micro-interaction"
              >
                <Phone className="w-4 h-4 mr-2" />
                {language === 'uz' ? 'Tezkor maslahat' : 'Быстрая консультация'}
              </Button>
            </motion.div>

            {/* Статистика с анимацией */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              {[
                { 
                  number: '500+', 
                  label: language === 'uz' ? 'Mamnun mijozlar' : 'Довольных клиентов' 
                },
                { 
                  number: '3+', 
                  label: language === 'uz' ? 'Yillik tajriba' : 'Года опыта' 
                },
                { 
                  number: '100%', 
                  label: language === 'uz' ? 'Sifat kafolati' : 'Гарантия качества' 
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
                  className="text-center glass-card p-6 rounded-xl relative overflow-hidden group cursor-pointer border border-primary/10"
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
          className="absolute left-1/2 transform -translate-x-1/2 p-3 rounded-full glass-effect border border-primary/20 hover:border-primary/40 micro-interaction group cursor-pointer"
          style={{ bottom: '17px' }}
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ y: 0, scale: 0.95 }}
        >
          {/* Пульсирующие круги */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{
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
            animate={{
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
            animate={{ y: [0, 6, 0] }}
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
                  {language === 'uz' ? 'Tezkor maslahat' : 'Быстрая консультация'}
                </span>
              </DialogTitle>
              <DialogDescription className="text-center text-base opacity-80">
                {language === 'uz' 
                  ? 'Ma\'lumotlaringizni qoldiring, biz siz bilan bog\'lanamiz'
                  : 'Оставьте свои данные, и мы свяжемся с вами'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitConsultation} className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder={language === 'uz' ? 'Ismingiz' : 'Ваше имя'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="glass-card border-primary/20 h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <Input
                    type="tel"
                    placeholder={language === 'uz' ? 'Telefon raqami' : 'Номер телефона'}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="glass-card border-primary/20 h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <Textarea
                    placeholder={language === 'uz' ? 'Qo\'shimcha xabar (ixtiyoriy)' : 'Дополнительное сообщение (необязательно)'}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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
                  {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.phone}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      {language === 'uz' ? 'Yuborish' : 'Отправить'}
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