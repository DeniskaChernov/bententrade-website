import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Factory, Shield, Users, Truck } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

export function WhyUs() {
  const { t, language } = useLanguage();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const reasons = [
    {
      icon: Factory,
      title: t.manufacturer,
      description: t.manufacturerDesc,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: t.quality,
      description: t.qualityDesc,
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: language === 'uz' ? 'Ulgurji va chakana' : 'Опт и розница',
      description: language === 'uz' ? 'Har qanday hajmlar bilan ishlaymiz' : 'Работаем с любыми объёмами',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Truck,
      title: t.delivery,
      description: t.deliveryDesc,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section id="why-us" className="pt-20 pb-20 relative overflow-hidden">
      {/* Расширенные декоративные плавающие элементы */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? 'rgba(212, 165, 116, 0.3)' : 'rgba(245, 243, 240, 0.4)'
          }}
          animate={{
            scale: [1, 1.5 + Math.random(), 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, (Math.random() - 0.5) * 50, 0],
            y: [0, (Math.random() - 0.5) * 50, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8 text-brand-cream"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
          >
{t.whyUsTitle}
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={inView ? { opacity: 1, width: '120px' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-brand-light to-brand-cream mx-auto rounded-full"
          />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, scale: 0.8, rotateY: -20 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1, rotateY: 0 } : { opacity: 0, y: 60, scale: 0.8, rotateY: -20 }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -15, 
                scale: 1.08,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="text-center group relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                className="relative mx-auto mb-6"
                whileHover={{ rotateY: 180, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring" }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Анимированный фон с 3D эффектом */}
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${reason.color} rounded-full flex items-center justify-center mx-auto relative overflow-hidden`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Вращающиеся блики */}
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)'
                    }}
                  />
                  
                  {/* Второй слой бликов для усиления эффекта */}
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: 'linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)'
                    }}
                  />
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.2 + 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <reason.icon className="w-8 h-8 text-white relative z-10" />
                  </motion.div>
                </motion.div>
                
                {/* Множественные пульсирующие эффекты */}
                <motion.div
                  className={`absolute inset-0 w-20 h-20 bg-gradient-to-r ${reason.color} rounded-full mx-auto opacity-30`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
                <motion.div
                  className={`absolute inset-0 w-20 h-20 bg-gradient-to-r ${reason.color} rounded-full mx-auto opacity-20`}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 + 0.5 }}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
              >
                <motion.h3 
                  className="font-bold mb-2 text-brand-cream group-hover:text-brand-light transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {reason.title}
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground text-sm group-hover:text-brand-light transition-colors duration-300"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {reason.description}
                </motion.p>
              </motion.div>
              
              {/* Декоративная анимированная линия */}
              <div className="relative h-0.5 mt-4 mx-auto" style={{ width: '60px' }}>
                <div
                  className="h-full bg-gradient-to-r from-brand-light to-accent rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}