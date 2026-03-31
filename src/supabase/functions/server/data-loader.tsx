/**
 * Data Loader для Bententrade
 * Загрузка всех данных каталога в Supabase KV Store
 * 
 * Запуск: Добавить роут в index.tsx и вызвать GET /make-server-ee878259/load-data
 */

import * as kv from './kv_store.tsx';

// Данные продуктов
export const productsData = {
  // Кашпо
  kashpo: [
    {
      id: '2',
      name: {
        ru: 'Кашпо 5л с ручкой',
        uz: 'Kashpo 5l tutqichli'
      },
      description: {
        ru: 'Компактное кашпо объёмом 5 литров с удобной ручкой для переноски',
        uz: '5 litrlik qo\'l tutqichli qulay kashpo'
      },
      category: 'kashpo',
      size: '5л',
      style: 'с ручкой',
      price: 120000,
      currency: 'сум',
      dimensions: {
        height: 255,
        diameter: 290
      },
      features: {
        ru: ['Объём 5 литров', 'Удобная ручка', 'Натуральный дизайн', 'Различные цвета'],
        uz: ['5 litr hajmi', 'Qulay tutqich', 'Tabiiy dizayn', 'Turli ranglar']
      },
      colors: ['beige', 'gray', 'white-birch']
    },
    {
      id: '3',
      name: {
        ru: 'Кашпо 10л Классик',
        uz: 'Kashpo 10l Klassik'
      },
      description: {
        ru: 'Классическое кашпо объёмом 10 литров для средних растений',
        uz: 'O\'rta o\'simliklar uchun 10 litrlik klassik kashpo'
      },
      category: 'kashpo',
      size: '10л',
      style: 'Классик',
      price: 187000,
      currency: 'сум',
      dimensions: {
        height: 240,
        diameter: 310
      },
      features: {
        ru: ['Объём 10 литров', 'Классический дизайн', 'Традиционное плетение', 'Различные цвета'],
        uz: ['10 litr hajmi', 'Klassik dizayn', 'An\'anaviy to\'qima', 'Turli ranglar']
      },
      colors: ['gray', 'brown', 'white-birch', 'yellow', 'buttery']
    },
    {
      id: '4',
      name: {
        ru: 'Кашпо 10л Пухляш',
        uz: 'Kashpo 10l Puhlyash'
      },
      description: {
        ru: 'Округлое кашпо объёмом 10 литров с мягким плетением',
        uz: 'Yumshoq to\'qimali 10 litrlik dumaloq kashpo'
      },
      category: 'kashpo',
      size: '10л',
      style: 'Пухляш',
      price: 187000,
      currency: 'сум',
      dimensions: {
        height: 240,
        diameter: 330
      },
      features: {
        ru: ['Объём 10 литров', 'Округлые формы', 'Мягкое плетение', 'Различные цвета'],
        uz: ['10 litr hajmi', 'Dumaloq shakllar', 'Yumshoq to\'qima', 'Turli ranglar']
      },
      colors: ['brown', 'beige', 'white-birch', 'yellow', 'buttery', 'brown-white', 'tricolor']
    },
    {
      id: '5',
      name: {
        ru: 'Кашпо 16л Классика',
        uz: 'Kashpo 16l Klassika'
      },
      description: {
        ru: 'Большое классическое кашпо объёмом 16 литров для крупных растений',
        uz: 'Katta o\'simliklar uchun 16 litrlik klassik kashpo'
      },
      category: 'kashpo',
      size: '16л',
      style: 'Классика',
      price: 245000,
      currency: 'сум',
      dimensions: {
        height: 285,
        diameter: 350
      },
      features: {
        ru: ['Объём 16 литров', 'Для крупных растений', 'Классический стиль', 'Различные цвета'],
        uz: ['16 litr hajmi', 'Katta o\'simliklar uchun', 'Klassik uslub', 'Turli ranglar']
      },
      colors: ['gray', 'brown', 'white-birch', 'yellow', 'buttery']
    },
    {
      id: '6',
      name: {
        ru: 'Кашпо 16л Пухляш',
        uz: 'Kashpo 16l Puhlyash'
      },
      description: {
        ru: 'Большое округлое кашпо объёмом 16 литров с мягким плетением',
        uz: 'Yumshoq to\'qimali 16 litrlik katta dumaloq kashpo'
      },
      category: 'kashpo',
      size: '16л',
      style: 'Пухляш',
      price: 245000,
      currency: 'сум',
      dimensions: {
        height: 280,
        diameter: 360
      },
      features: {
        ru: ['Объём 16 литров', 'Мягкие округлые формы', 'Для больших растений', 'Различные цвета'],
        uz: ['16 litr hajmi', 'Yumshoq dumaloq shakllar', 'Katta o\'simliklar uchun', 'Turli ranglar']
      },
      colors: ['brown', 'beige', 'white-birch', 'yellow', 'buttery', 'brown-white', 'tricolor']
    }
  ],
  
  // Ротанговая нить
  rattan: [
    {
      id: '1',
      name: {
        ru: 'Ротанговая нить Полусфера',
        uz: 'Rattan ip Yarim sfera'
      },
      description: {
        ru: 'Качественная искусственная ротанговая нить профиль полусфера',
        uz: 'Sifatli sun\'iy rattan ip yarim sfera profil'
      },
      category: 'materials',
      profile: 'Полусфера',
      price: 36000,
      currency: 'сум',
      unit: 'кг',
      minQuantity: 5,
      features: {
        ru: ['Профиль полусфера', 'Различные цвета', 'Высокая прочность', 'Для классического плетения'],
        uz: ['Yarim sfera profil', 'Turli ranglar', 'Yuqori mustahkamlik', 'Klassik to\'qish uchun']
      },
      colors: ['pearl-2305', 'sand-2310', 'light-grey-2708', 'gold-5830', 'brushed-grey-0510', 'mahogany-0609', 'white-birch-0310', 'bronze-1710', 'purple-3034', 'grey-3045']
    },
    {
      id: '1-flat',
      name: {
        ru: 'Ротанговая нить Плоская',
        uz: 'Rattan ip Tekis'
      },
      description: {
        ru: 'Качественная искусственная ротанговая нить плоский профиль',
        uz: 'Sifatli sun\'iy rattan ip tekis profil'
      },
      category: 'materials',
      profile: 'Плоская',
      price: 36000,
      currency: 'сум',
      unit: 'кг',
      minQuantity: 5,
      features: {
        ru: ['Плоский профиль', 'Гладкое плетение', 'От 6 до 10мм', 'Высокая прочность'],
        uz: ['Tekis profil', 'Silliq to\'qish', '6 dan 10mm gacha', 'Yuqori mustahkamlik']
      },
      colors: ['brown-0306', 'pale-yellow-1110', 'pearl-2305', 'sand-2310', 'light-grey-2809', 'purple-3034', 'grey-3045']
    },
    {
      id: '1-crescent',
      name: {
        ru: 'Ротанговая нить Полумесяц',
        uz: 'Rattan ip Yarim oy'
      },
      description: {
        ru: 'Качественная искусственная ротанговая нить профиль полумесяц',
        uz: 'Sifatli sun\'iy rattan ip yarim oy profil'
      },
      category: 'materials',
      profile: 'Полумесяц',
      price: 36000,
      currency: 'сум',
      unit: 'кг',
      minQuantity: 5,
      features: {
        ru: ['Профиль полумесяц', 'Различные цвета', 'Декоративное плетение', 'Уникальная форма'],
        uz: ['Yarim oy profil', 'Turli ranglar', 'Bezak to\'qish', 'Noyob shakl']
      },
      colors: ['pearl-2305', 'sand-2310', 'light-grey-2708', 'gold-5830', 'brushed-grey-0510', 'mahogany-0609', 'white-1706', 'purple-3034', 'grey-3045']
    },
    {
      id: '1-tube',
      name: {
        ru: 'Ротанговая нить Трубка',
        uz: 'Rattan ip Nay'
      },
      description: {
        ru: 'Эксклюзивная ротанговая нить профиль трубка - Черная с золотыми наплывами',
        uz: 'Eksklyuziv rattan ip nay profil - Oltin oqimli qora'
      },
      category: 'materials',
      profile: 'Трубка',
      price: 36000,
      currency: 'сум',
      unit: 'кг',
      minQuantity: 5,
      features: {
        ru: ['Профиль трубка', 'Эксклюзивный цвет', 'Полая структура', 'Лёгкое плетение'],
        uz: ['Nay profil', 'Eksklyuziv rang', 'Bo\'sh tuzilma', 'Yengil to\'qish']
      },
      colors: ['black-gold-2104']
    }
  ]
};

// Цены
export const pricing = {
  kashpo: {
    '5l': 120000,
    '10l': 187000,
    '16l': 245000
  },
  rattan: {
    pricePerKg: 36000,
    minQuantityKg: 5,
    minTotalPrice: 180000
  }
};

// Контакты
export const contacts = {
  company: 'Bententrade',
  phone: '+998 77 104 44 22',
  telegram: '@bententrade',
  email: 'info@bententrade.uz',
  address: {
    ru: 'Ташкент, Узбекистан',
    uz: 'Toshkent, O\'zbekiston'
  },
  workingHours: {
    ru: 'Пн-Сб: 9:00 - 18:00',
    uz: 'Dush-Shan: 9:00 - 18:00'
  }
};

// Функция загрузки данных в KV store
export async function loadAllDataToKV() {
  console.log('🚀 Начинаем загрузку данных в Supabase KV Store...');
  
  try {
    // 1. Загружаем продукты Кашпо
    console.log('📦 Загрузка кашпо...');
    await kv.set('products:kashpo', JSON.stringify(productsData.kashpo));
    
    // 2. Загружаем продукты Ротанг
    console.log('🧵 Загрузка ротанговой нити...');
    await kv.set('products:rattan', JSON.stringify(productsData.rattan));
    
    // 3. Загружаем цены
    console.log('💰 Загрузка цен...');
    await kv.set('pricing', JSON.stringify(pricing));
    
    // 4. Загружаем контакты
    console.log('📞 Загрузка контактов...');
    await kv.set('contacts', JSON.stringify(contacts));
    
    // 5. Загружаем информацию о сайте
    console.log('ℹ️ Загрузка информации о сайте...');
    const siteInfo = {
      name: 'Bententrade',
      domain: 'bententrade.uz',
      description: {
        ru: 'Производство искусственной ротанговой нити и плетёных кашпо в Ташкенте',
        uz: 'Toshkentda sun\'iy rattan ip va to\'qilgan kashpo ishlab chiqarish'
      },
      languages: ['ru', 'uz'],
      defaultLanguage: 'ru',
      currency: 'сум',
      lastUpdated: new Date().toISOString()
    };
    await kv.set('site:info', JSON.stringify(siteInfo));
    
    console.log('✅ Все данные успешно загружены в Supabase KV Store!');
    
    return {
      success: true,
      message: 'Данные успешно загружены',
      data: {
        kashpoCount: productsData.kashpo.length,
        rattanCount: productsData.rattan.length,
        totalProducts: productsData.kashpo.length + productsData.rattan.length
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных:', error);
    return {
      success: false,
      message: 'Ошибка при загрузке данных',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Функция получения всех данных
export async function getAllData() {
  try {
    const [kashpoData, rattanData, pricingData, contactsData, siteInfoData] = await Promise.all([
      kv.get('products:kashpo'),
      kv.get('products:rattan'),
      kv.get('pricing'),
      kv.get('contacts'),
      kv.get('site:info')
    ]);
    
    return {
      success: true,
      data: {
        kashpo: kashpoData ? JSON.parse(kashpoData) : [],
        rattan: rattanData ? JSON.parse(rattanData) : [],
        pricing: pricingData ? JSON.parse(pricingData) : {},
        contacts: contactsData ? JSON.parse(contactsData) : {},
        siteInfo: siteInfoData ? JSON.parse(siteInfoData) : {}
      }
    };
  } catch (error) {
    console.error('❌ Ошибка при получении данных:', error);
    return {
      success: false,
      message: 'Ошибка при получении данных',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}