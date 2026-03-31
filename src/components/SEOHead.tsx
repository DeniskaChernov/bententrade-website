import { memo, useEffect } from 'react';
import { useLanguage } from '../utils/language-context';

interface SEOHeadProps {
  page: 'home' | 'catalog' | 'legal';
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  // ❌ УДАЛЕНО: noindex больше не используется - ВСЕГДА index!
}

export const SEOHead = memo(function SEOHead({ 
  page, 
  title: customTitle, 
  description: customDescription,
  keywords: customKeywords,
  image: customImage
  // ❌ УДАЛЕНО: noindex = false
}: SEOHeadProps) {
  const { language } = useLanguage();

  // SEO данные для разных страниц на русском
  const seoDataRu = {
    home: {
      title: 'Купить ротанговую нить в Ташкенте от 36000 сум | Плетеные кашпо 18 цветов - Bententrade',
      description: '⭐ Ротанговая нить от производителя - 36000 сум/кг, 5 типов, 18 цветов ⭐ Плетеные кашпо ручной работы от 120000 сум ⭐ Доставка по Узбекистану ☎️ +998 77 104 44 22',
      keywords: 'ротанговая нить ташкент, купить ротанг ташкент, кашпо купить ташкент, плетеные кашпо, искусственый ротанг узбекистан, ротанг оптом, кашпо ротанг, синтетический ротанг, мебельная нить, ротанг цена за кг, кашпо ручной работы, плетение ротанг, купить ротанг для плетения, ротанг 18 цветов, кашпо 10 литров'
    },
    catalog: {
      title: 'Каталог: Ротанговая нить 36000 сум/кг и Плетеные кашпо от 120000 сум | Bententrade Ташкент',
      description: '✅ Полный каталог ротанговой нити (5 типов) и плетёных кашпо от производителя ✅ 18 цветов в наличии ✅ Цены: ротанг 36000 сум/кг, кашпо от 120000 сум ✅ Оптом и в розницу',
      keywords: 'каталог ротанга, купить ротанг ташкент цена, кашпо каталог цены, ротанг оптом цена, плетеные изделия каталог, кашпо настенные, подвесные кашпо, напольные кашпо, ротанг полусфера, ротанг сфера, ротанг плоский'
    },
    legal: {
      title: 'Юридическая информация | Bententrade',
      description: 'Политика конфиденциальности, условия использования и политика возврата - Bententrade',
      keywords: 'политика конфиденциальности, условия использования, возврат товара'
    }
  };

  // SEO данные для разных страниц на узбекском
  const seoDataUz = {
    home: {
      title: 'Bententrade - Toshkentda rattan ip va to\'qilgan guldonlar | Sun\'iy rattan sotib olish',
      description: 'Toshkentda sifatli sun\'iy rattan ip va to\'qilgan guldonlarni ishlab chiqarish va sotish. Keng rang va o\'lchamlar tanlovi. O\'zbekiston bo\'ylab yetkazib berish. ☎️ +998 77 104 44 22',
      keywords: 'rattan ip, rattan sotib olish, to\'qilgan guldonlar, sun\'iy rattan, Toshkent, O\'zbekiston, rattan narxi, guldon sotib olish, bententrade'
    },
    catalog: {
      title: 'Mahsulotlar katalogi - Rattan ip va guldonlar | Bententrade Toshkent',
      description: 'Ishlab chiqaruvchidan rattan ip va to\'qilgan guldonlarning to\'liq katalogi. Turli o\'lchamlar, ranglar va uslublar. Toshkentda sifatli mahsulotlar. Narxlar 35 000 so\'mdan.',
      keywords: 'rattan katalogi, rattan sotib olish toshkent, guldon katalogi, rattan narxlari, to\'qilgan mahsulotlar'
    },
    legal: {
      title: 'Yuridik ma\'lumot | Bententrade',
      description: 'Maxfiylik siyosati, foydalanish shartlari va qaytarish siyosati - Bententrade',
      keywords: 'maxfiylik siyosati, foydalanish shartlari, mahsulot qaytarish'
    }
  };

  const seoData = language === 'uz' ? seoDataUz : seoDataRu;
  const pageData = seoData[page];

  const title = customTitle || pageData.title;
  const description = customDescription || pageData.description;
  const keywords = customKeywords || pageData.keywords;
  const image = customImage || 'https://bententrade.uz/og-image.png';
  const canonicalUrl = page === 'catalog' 
    ? 'https://bententrade.uz/catalog' 
    : 'https://bententrade.uz/';

  useEffect(() => {
    // Обновляем title
    document.title = title;

    // ✅ ВАЖНО: Удаляем ВСЕ старые мета-теги robots (из index.html тоже!)
    // Удаляем старые теги с data-seo="true" (созданные этим компонентом)
    const oldMetaTags = document.querySelectorAll('meta[data-seo="true"]');
    oldMetaTags.forEach(tag => tag.remove());
    
    // Удаляем также теги из index.html, чтобы не было дублирования
    const robotsFromHTML = document.querySelectorAll('meta[name="robots"], meta[name="googlebot"], meta[name="bingbot"]');
    robotsFromHTML.forEach(tag => {
      // Удаляем только если НЕ создан этим компонентом
      if (!tag.hasAttribute('data-seo')) {
        tag.remove();
      }
    });

    // Создаем массив мета-тегов
    const metaTags: Array<{name?: string; property?: string; httpEquiv?: string; content: string}> = [
      // Robots
      { 
        name: 'robots', 
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'bingbot', content: 'index, follow' },
      
      // Primary Meta Tags
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'Bententrade' },
      
      // Language & Geo
      { httpEquiv: 'content-language', content: language === 'uz' ? 'uz-UZ' : 'ru-UZ' },
      { name: 'geo.region', content: 'UZ-TK' },
      { name: 'geo.placename', content: 'Ташкент' },
      { name: 'geo.position', content: '41.2995;69.2401' },
      { name: 'ICBM', content: '41.2995, 69.2401' },
      
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: 'Bententrade' },
      { property: 'og:locale', content: language === 'uz' ? 'uz_UZ' : 'ru_UZ' },
      { property: 'og:locale:alternate', content: language === 'uz' ? 'ru_UZ' : 'uz_UZ' },
      
      // Twitter
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: canonicalUrl },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: image },
      
      // Mobile
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0' },
      { name: 'theme-color', content: '#D4A574' },
      
      // Performance
      { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'format-detection', content: 'telephone=no' },
      
      // Google verification
      { name: 'google-site-verification', content: 'QnkIBpzO6K2FktpV6_xI4QtjDQxHVcfVkNSC9WEstHY' }
    ];

    // Добавляем мета-теги
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.setAttribute('property', tag.property);
      if (tag.httpEquiv) meta.setAttribute('http-equiv', tag.httpEquiv);
      meta.content = tag.content;
      
      document.head.appendChild(meta);
    });

    // Обновляем или создаем canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Добавляем hreflang links
    const hreflangRu = document.querySelector('link[hreflang="ru"]') as HTMLLinkElement 
      || document.createElement('link');
    hreflangRu.rel = 'alternate';
    hreflangRu.hreflang = 'ru';
    hreflangRu.href = canonicalUrl;
    if (!hreflangRu.parentNode) document.head.appendChild(hreflangRu);

    const hreflangUz = document.querySelector('link[hreflang="uz"]') as HTMLLinkElement 
      || document.createElement('link');
    hreflangUz.rel = 'alternate';
    hreflangUz.hreflang = 'uz';
    hreflangUz.href = canonicalUrl;
    if (!hreflangUz.parentNode) document.head.appendChild(hreflangUz);

    const hreflangXDefault = document.querySelector('link[hreflang="x-default"]') as HTMLLinkElement 
      || document.createElement('link');
    hreflangXDefault.rel = 'alternate';
    hreflangXDefault.hreflang = 'x-default';
    hreflangXDefault.href = 'https://bententrade.uz/';
    if (!hreflangXDefault.parentNode) document.head.appendChild(hreflangXDefault);

  }, [title, description, keywords, image, canonicalUrl, language]);

  return null;
});