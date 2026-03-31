// ==========================================
// PRODUCTS API - Управление каталогом товаров
// ==========================================

import { Hono } from "npm:hono";
import * as kv from './kv_store.tsx';

const productsApp = new Hono();

// Интерфейсы для товаров
interface ColorVariant {
  id: string;
  name: string;
  images: string[];
  color: string;
  gradient?: string;
  article?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features?: string[];
  variants?: ColorVariant[];
  category: string;
  size?: string;
  style?: string;
  dimensions?: {
    height: number;
    diameter: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// ПОЛУЧЕНИЕ ВСЕХ ТОВАРОВ
// ==========================================
productsApp.get("/", async (c) => {
  try {
    console.log('📦 [Products API] Fetching all products...');
    
    // Получаем все товары с префиксом product:
    const products = await kv.getByPrefix('product:');
    
    console.log(`✅ [Products API] Found ${products.length} products`);
    
    return c.json({ 
      success: true,
      products,
      total: products.length
    });

  } catch (error) {
    console.error('❌ [Products API] Error fetching products:', error);
    return c.json({ 
      success: false,
      error: "Failed to fetch products",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// ПОЛУЧЕНИЕ ОДНОГО ТОВАРА ПО ID
// ==========================================
productsApp.get("/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    console.log(`📦 [Products API] Fetching product: ${productId}`);
    
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ 
        success: false,
        error: "Product not found" 
      }, 404);
    }
    
    console.log(`✅ [Products API] Product found: ${product.name}`);
    
    return c.json({ 
      success: true,
      product
    });

  } catch (error) {
    console.error('❌ [Products API] Error fetching product:', error);
    return c.json({ 
      success: false,
      error: "Failed to fetch product",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// СОЗДАНИЕ НОВОГО ТОВАРА
// ==========================================
productsApp.post("/", async (c) => {
  try {
    const body = await c.req.json();
    console.log('📦 [Products API] Creating new product...');
    
    // Валидация обязательных полей
    if (!body.name || !body.description || !body.category) {
      return c.json({ 
        success: false,
        error: "Missing required fields: name, description, category" 
      }, 400);
    }

    // Генерация ID если не указан
    const productId = body.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const now = new Date().toISOString();
    
    const product: Product = {
      ...body,
      id: productId,
      createdAt: now,
      updatedAt: now
    };

    // Сохраняем товар в KV store
    await kv.set(`product:${productId}`, product);
    
    console.log(`✅ [Products API] Product created: ${product.name} (${productId})`);
    
    return c.json({ 
      success: true,
      product
    });

  } catch (error) {
    console.error('❌ [Products API] Error creating product:', error);
    return c.json({ 
      success: false,
      error: "Failed to create product",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// ОБНОВЛЕНИЕ ТОВАРА
// ==========================================
productsApp.put("/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    const body = await c.req.json();
    
    console.log(`📦 [Products API] Updating product: ${productId}`);
    
    // Проверяем существование товара
    const existingProduct = await kv.get(`product:${productId}`);
    
    if (!existingProduct) {
      return c.json({ 
        success: false,
        error: "Product not found" 
      }, 404);
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...body,
      id: productId, // ID не должен изменяться
      updatedAt: new Date().toISOString()
    };

    // Сохраняем обновлённый товар
    await kv.set(`product:${productId}`, updatedProduct);
    
    console.log(`✅ [Products API] Product updated: ${updatedProduct.name}`);
    
    return c.json({ 
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ [Products API] Error updating product:', error);
    return c.json({ 
      success: false,
      error: "Failed to update product",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// УДАЛЕНИЕ ТОВАРА
// ==========================================
productsApp.delete("/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    console.log(`📦 [Products API] Deleting product: ${productId}`);
    
    // Проверяем существование товара
    const existingProduct = await kv.get(`product:${productId}`);
    
    if (!existingProduct) {
      return c.json({ 
        success: false,
        error: "Product not found" 
      }, 404);
    }
    
    // Удаляем товар
    await kv.del(`product:${productId}`);
    
    console.log(`✅ [Products API] Product deleted: ${productId}`);
    
    return c.json({ 
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error('❌ [Products API] Error deleting product:', error);
    return c.json({ 
      success: false,
      error: "Failed to delete product",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// МАССОВАЯ ЗАГРУЗКА ТОВАРОВ (для миграции)
// ==========================================
productsApp.post("/bulk", async (c) => {
  try {
    const { products } = await c.req.json();
    
    if (!Array.isArray(products)) {
      return c.json({ 
        success: false,
        error: "Products must be an array" 
      }, 400);
    }
    
    console.log(`📦 [Products API] Bulk upload: ${products.length} products`);
    
    const now = new Date().toISOString();
    const results = [];
    
    for (const product of products) {
      const productId = product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      const productData: Product = {
        ...product,
        id: productId,
        createdAt: product.createdAt || now,
        updatedAt: now
      };
      
      await kv.set(`product:${productId}`, productData);
      results.push(productData);
    }
    
    console.log(`✅ [Products API] Bulk upload completed: ${results.length} products saved`);
    
    return c.json({ 
      success: true,
      products: results,
      total: results.length
    });

  } catch (error) {
    console.error('❌ [Products API] Error in bulk upload:', error);
    return c.json({ 
      success: false,
      error: "Failed to upload products",
      details: error.message 
    }, 500);
  }
});

// ==========================================
// ФИЛЬТРАЦИЯ ТОВАРОВ
// ==========================================
productsApp.get("/filter/:category", async (c) => {
  try {
    const category = c.req.param('category');
    console.log(`📦 [Products API] Filtering by category: ${category}`);
    
    // Получаем все товары
    const allProducts = await kv.getByPrefix('product:');
    
    // Фильтруем по категории
    const filteredProducts = allProducts.filter((p: Product) => p.category === category);
    
    console.log(`✅ [Products API] Found ${filteredProducts.length} products in category ${category}`);
    
    return c.json({ 
      success: true,
      products: filteredProducts,
      total: filteredProducts.length,
      category
    });

  } catch (error) {
    console.error('❌ [Products API] Error filtering products:', error);
    return c.json({ 
      success: false,
      error: "Failed to filter products",
      details: error.message 
    }, 500);
  }
});

export default productsApp;
