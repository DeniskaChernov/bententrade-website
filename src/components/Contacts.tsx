import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Button } from './ui/button';
import { Phone, MessageCircle, Send, MapPin, Clock, ExternalLink } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

export function Contacts() {
  const { t, language } = useLanguage();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Функции для открытия контактов
  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/[\s\+]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const openTelegram = () => {
    window.open('https://t.me/BenTenTrade', '_blank');
  };

  const callPhone = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  // Контактные данные менеджеров
  const managers = [
    { 
      name: language === 'uz' ? 'Denis' : 'Денис', 
      number: '+998 77 104 44 22',
      cleanNumber: '998771044422'
    }
  ];

  const contactCards = [
    {
      icon: Phone,
      title: language === 'uz' ? 'Telefonlar' : 'Телефоны',
      subtitle: language === 'uz' ? 'Bizga qo\'ng\'iroq qiling' : 'Позвоните нам',
      color: 'from-blue-500 to-blue-600',
      managers: managers,
      type: 'phone' as const,
      delay: 0
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      subtitle: language === 'uz' ? 'Tezkor xabar yozing' : 'Быстрые сообщения',
      color: 'from-green-500 to-green-600',
      managers: managers,
      type: 'whatsapp' as const,
      delay: 0.1
    },
    {
      icon: Send,
      title: 'Telegram',
      subtitle: language === 'uz' ? 'Bizning kanalimiz' : 'Наш канал',
      description: '@BenTenTrade',
      color: 'from-blue-400 to-blue-500',
      action: openTelegram,
      type: 'telegram' as const,
      delay: 0.2
    },
    {
      icon: MapPin,
      title: language === 'uz' ? 'Manzil' : 'Адрес',
      description: language === 'uz' ? 'Toshkent, O\'zbekiston' : 'Ташкент, Узбекистан',
      color: 'from-amber-500 to-amber-600',
      type: 'info' as const,
      delay: 0.3
    },
    {
      icon: Clock,
      title: language === 'uz' ? 'Ish vaqti' : 'Режим работы',
      description: language === 'uz' ? 'Du-Shan: 9:00-19:00' : 'Пн-Сб: 9:00-19:00',
      color: 'from-purple-500 to-purple-600',
      type: 'info' as const,
      delay: 0.4
    }
  ];

  return (
    <section id="contacts" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-grotesk mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-gradient">
              {language === 'uz' ? 'Aloqa' : 'Контакты'}
            </span>
          </motion.h2>
          
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {language === 'uz' 
              ? 'Sizga qulay usulda biz bilan bog\'laning. Har doim yordam berishga tayyormiz!'
              : 'Свяжитесь с нами удобным способом. Всегда готовы помочь!'}
          </motion.p>
        </div>
        
        {/* Карточки контактов */}
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {contactCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                transition={{ duration: 0.6, delay: card.delay }}
                className="h-full"
              >
                {/* Карточка с телефонами/WhatsApp - с кнопками менеджеров */}
                {(card.type === 'phone' || card.type === 'whatsapp') && card.managers ? (
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col hover-lift group border border-primary/10">
                    {/* Иконка */}
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 neon-glow group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <card.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Заголовок */}
                    <h3 className="text-lg font-grotesk mb-1 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {card.subtitle}
                    </p>

                    {/* Кнопки менеджеров */}
                    <div className="space-y-2 mt-auto">
                      {card.managers.map((manager, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => card.type === 'phone' ? callPhone(manager.number) : openWhatsApp(manager.cleanNumber)}
                          className="w-full glass-effect rounded-xl px-3 py-2.5 text-left hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 group/btn micro-interaction"
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-primary/70 mb-0.5 font-medium group-hover/btn:text-primary transition-colors">
                                {manager.name}
                              </div>
                              <div className="text-sm truncate group-hover/btn:text-primary transition-colors">
                                {manager.number}
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-primary transition-colors flex-shrink-0 ml-2" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : card.type === 'telegram' && card.action ? (
                  // Карточка Telegram - кликабельная целиком
                  <motion.button
                    onClick={card.action}
                    className="glass-card rounded-2xl p-6 h-full flex flex-col hover-lift group border border-primary/10 w-full text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Иконка */}
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 neon-glow group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <card.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Заголовок */}
                    <h3 className="text-lg font-grotesk mb-1 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {card.subtitle}
                    </p>

                    {/* Описание с иконкой */}
                    <div className="mt-auto flex items-center gap-2 text-sm text-primary/80 group-hover:text-primary transition-colors">
                      <span>{card.description}</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </motion.button>
                ) : (
                  // Информационные карточки (адрес, время работы)
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col group border border-primary/10">
                    {/* Иконка */}
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <card.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Заголовок */}
                    <h3 className="text-lg font-grotesk mb-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>

                    {/* Описание */}
                    <p className="text-sm text-muted-foreground mt-auto">
                      {card.description}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto border border-primary/10">
              <p className="text-sm text-muted-foreground">
                {language === 'uz' 
                  ? '💬 Savollaringiz bormi? WhatsApp yoki Telegram orqali yozing - tezkor javob beramiz!'
                  : '💬 Есть вопросы? Напишите в WhatsApp или Telegram — ответим быстро!'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}