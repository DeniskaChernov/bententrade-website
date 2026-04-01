import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import handler from 'serve-handler';
import { Pool } from 'pg';

const port = Number(process.env.PORT || 3000);
const apiPrefix = '/api';

const API_TOKEN = process.env.API_TOKEN || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      variants JSONB NOT NULL DEFAULT '[]'::jsonb,
      category TEXT NOT NULL DEFAULT '',
      size TEXT,
      style TEXT,
      dimensions JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      customer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'pending',
      language TEXT NOT NULL DEFAULT 'ru',
      telegram_message_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);
}

function normalizeHtmlPathname(p) {
  if (p !== '/' && p.endsWith('/')) return p.slice(0, -1) || '/';
  return p;
}

const PRERENDER_HTML = {
  '/': 'index.html',
  '/catalog': 'catalog.html',
  '/legal': 'legal.html',
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Password');
}

function getBearerToken(req) {
  const raw = req.headers.authorization || '';
  if (!raw.startsWith('Bearer ')) return '';
  return raw.slice(7).trim();
}

function isAuthorized(req) {
  if (!API_TOKEN) return true;
  return getBearerToken(req) === API_TOKEN;
}

function isAdminAuthorized(req, body) {
  const provided = req.headers['x-admin-password'] || body?.password || '';
  if (!ADMIN_PASSWORD) return false;
  return String(provided) === ADMIN_PASSWORD;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    features: row.features || [],
    variants: row.variants || [],
    category: row.category,
    size: row.size || undefined,
    style: row.style || undefined,
    dimensions: row.dimensions || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderRow(row) {
  return {
    id: row.id,
    items: row.items || [],
    customerInfo: row.customer_info || {},
    status: row.status,
    language: row.language,
    telegramMessageId: row.telegram_message_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function sendTelegram(text, chatId = TELEGRAM_CHAT_ID) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    return { success: false, error: 'Telegram is not configured' };
  }

  const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  const tgData = await tgResponse.json();
  if (!tgResponse.ok || !tgData.ok) {
    return { success: false, error: tgData.description || 'Telegram API error' };
  }

  return { success: true, messageId: tgData.result?.message_id ? String(tgData.result.message_id) : null };
}

function formatOrderMessage(orderData) {
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const customer = orderData.customerInfo || {};
  const lines = [
    '🛒 <b>Новый заказ Bententrade</b>',
    '',
    '<b>Товары:</b>',
  ];

  items.forEach((item, idx) => {
    const parts = [`${idx + 1}. ${item.name || 'Товар'}`, `x${item.quantity || 1}`];
    if (item.variant) parts.push(`цвет: ${item.variant}`);
    if (item.size) parts.push(`размер: ${item.size}`);
    if (item.style) parts.push(`стиль: ${item.style}`);
    lines.push(`• ${parts.join(' | ')}`);
  });

  lines.push('');
  lines.push('<b>Клиент:</b>');
  lines.push(`Имя: ${customer.name || '-'}`);
  lines.push(`Телефон: ${customer.phone || '-'}`);
  if (customer.address) lines.push(`Адрес: ${customer.address}`);
  if (customer.notes) lines.push(`Комментарий: ${customer.notes}`);
  if (orderData.total) lines.push(`Сумма: ${orderData.total}`);
  lines.push(`Язык: ${orderData.language || 'ru'}`);
  lines.push(`Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`);

  return lines.join('\n');
}

async function handleApi(req, res, pathname) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { success: false, error: 'Unauthorized' });
    return true;
  }

  const method = req.method || 'GET';
  const path = pathname.replace(apiPrefix, '') || '/';

  try {
    if (method === 'POST' && path === '/admin/login') {
      const body = await readBody(req);
      const ok = isAdminAuthorized(req, body);
      sendJson(res, ok ? 200 : 401, { success: ok, error: ok ? undefined : 'Неверный пароль' });
      return true;
    }

    if (method === 'GET' && path === '/products') {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, { success: true, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path.startsWith('/products/filter/')) {
      const category = decodeURIComponent(path.replace('/products/filter/', ''));
      const result = await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY created_at ASC', [category]);
      sendJson(res, 200, { success: true, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
      if (!result.rows.length) {
        sendJson(res, 404, { success: false, error: 'Product not found' });
        return true;
      }
      sendJson(res, 200, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'POST' && path === '/products') {
      const body = await readBody(req);
      const id = body.id || randomUUID();
      const now = new Date().toISOString();
      const result = await pool.query(
        `INSERT INTO products (id, name, description, image, features, variants, category, size, style, dimensions, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
         RETURNING *`,
        [
          id,
          body.name || '',
          body.description || '',
          body.image || '',
          JSON.stringify(body.features || []),
          JSON.stringify(body.variants || []),
          body.category || '',
          body.size || null,
          body.style || null,
          body.dimensions ? JSON.stringify(body.dimensions) : null,
          now,
        ],
      );
      sendJson(res, 201, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'PUT' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      const body = await readBody(req);
      const existing = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
      if (!existing.rows.length) {
        sendJson(res, 404, { success: false, error: 'Product not found' });
        return true;
      }
      const current = existing.rows[0];
      const result = await pool.query(
        `UPDATE products
         SET name=$2, description=$3, image=$4, features=$5, variants=$6, category=$7, size=$8, style=$9, dimensions=$10, updated_at=NOW()
         WHERE id=$1
         RETURNING *`,
        [
          id,
          body.name ?? current.name,
          body.description ?? current.description,
          body.image ?? current.image,
          JSON.stringify(body.features ?? current.features ?? []),
          JSON.stringify(body.variants ?? current.variants ?? []),
          body.category ?? current.category,
          body.size ?? current.size,
          body.style ?? current.style,
          body.dimensions ? JSON.stringify(body.dimensions) : current.dimensions,
        ],
      );
      sendJson(res, 200, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'DELETE' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      sendJson(res, 200, { success: true });
      return true;
    }

    if (method === 'POST' && path === '/products/bulk') {
      const body = await readBody(req);
      const products = Array.isArray(body.products) ? body.products : [];
      await pool.query('BEGIN');
      try {
        await pool.query('DELETE FROM products');
        for (const p of products) {
          await pool.query(
            `INSERT INTO products (id, name, description, image, features, variants, category, size, style, dimensions)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              p.id || randomUUID(),
              p.name || '',
              p.description || '',
              p.image || '',
              JSON.stringify(p.features || []),
              JSON.stringify(p.variants || []),
              p.category || '',
              p.size || null,
              p.style || null,
              p.dimensions ? JSON.stringify(p.dimensions) : null,
            ],
          );
        }
        await pool.query('COMMIT');
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, { success: true, total: result.rows.length, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path === '/orders') {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      sendJson(res, 200, { success: true, orders: result.rows.map(mapOrderRow), storageMode: 'database' });
      return true;
    }

    if (method === 'POST' && path === '/orders') {
      const body = await readBody(req);
      const id = `ORD-${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO orders (id, items, customer_info, status, language, telegram_message_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [
          id,
          JSON.stringify(body.items || []),
          JSON.stringify(body.customerInfo || {}),
          body.status || 'pending',
          body.language || 'ru',
          body.telegramMessageId || null,
        ],
      );
      sendJson(res, 201, { success: true, orderId: id, order: mapOrderRow(result.rows[0]) });
      return true;
    }

    if (method === 'PUT' && path.startsWith('/orders/') && path.endsWith('/status')) {
      const id = decodeURIComponent(path.replace('/orders/', '').replace('/status', ''));
      const body = await readBody(req);
      const result = await pool.query(
        'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id, body.status || 'pending'],
      );
      if (!result.rows.length) {
        sendJson(res, 404, { success: false, error: 'Order not found' });
        return true;
      }
      sendJson(res, 200, { success: true, order: mapOrderRow(result.rows[0]) });
      return true;
    }

    if (method === 'DELETE' && path.startsWith('/orders/')) {
      const id = decodeURIComponent(path.replace('/orders/', ''));
      await pool.query('DELETE FROM orders WHERE id = $1', [id]);
      sendJson(res, 200, { success: true });
      return true;
    }

    if (method === 'GET' && path === '/stats') {
      const result = await pool.query('SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status');
      const stats = {
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        archivedOrders: 0,
      };
      for (const row of result.rows) {
        const count = Number(row.count);
        stats.totalOrders += count;
        if (row.status === 'pending') stats.pendingOrders = count;
        if (row.status === 'processing') stats.processingOrders = count;
        if (row.status === 'completed') stats.completedOrders = count;
      }
      stats.activeOrders = stats.pendingOrders + stats.processingOrders;
      stats.archivedOrders = stats.completedOrders;
      sendJson(res, 200, { success: true, stats, storageMode: 'database' });
      return true;
    }

    if (method === 'POST' && path === '/telegram/send') {
      const body = await readBody(req);
      const message = formatOrderMessage(body);
      const sent = await sendTelegram(message);
      if (!sent.success) {
        sendJson(res, 400, { success: false, error: sent.error });
        return true;
      }
      sendJson(res, 200, { success: true, messageId: sent.messageId });
      return true;
    }

    if (method === 'GET' && path === '/telegram/chats') {
      if (!TELEGRAM_BOT_TOKEN) {
        sendJson(res, 200, { success: false, error: 'TELEGRAM_BOT_TOKEN is not configured', chats: [] });
        return true;
      }
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        sendJson(res, 400, { success: false, error: data.description || 'Unable to fetch chats', chats: [] });
        return true;
      }

      const chats = new Map();
      for (const update of data.result || []) {
        const chat = update?.message?.chat || update?.channel_post?.chat;
        if (!chat?.id) continue;
        chats.set(String(chat.id), {
          id: String(chat.id),
          title: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || `Chat ${chat.id}`,
          type: chat.type || 'unknown',
        });
      }
      sendJson(res, 200, { success: true, chats: Array.from(chats.values()) });
      return true;
    }

    if (method === 'POST' && path === '/telegram/test') {
      const body = await readBody(req);
      const result = await sendTelegram(
        `🧪 Тест Telegram от Bententrade\nВремя: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
        body.chatId || TELEGRAM_CHAT_ID,
      );
      sendJson(res, result.success ? 200 : 400, result);
      return true;
    }

    if (method === 'GET' && path === '/load-data') {
      const existing = await pool.query('SELECT COUNT(*)::int AS count FROM products');
      if (Number(existing.rows[0]?.count || 0) > 0) {
        sendJson(res, 200, {
          success: true,
          data: {
            totalProducts: Number(existing.rows[0].count),
          },
          message: 'Данные уже загружены',
        });
        return true;
      }

      const seedProducts = [
        {
          id: '2',
          name: 'Кашпо 5л с ручкой',
          description: 'Плетеное кашпо 5 литров с ручкой',
          image: '/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp',
          category: 'kashpo',
          size: '5л',
        },
        {
          id: '3',
          name: 'Кашпо 10л Классика',
          description: 'Плетеное кашпо 10 литров',
          image: '/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp',
          category: 'kashpo',
          size: '10л',
          style: 'Классика',
        },
        {
          id: '4',
          name: 'Кашпо 16л Классика',
          description: 'Большое плетеное кашпо 16 литров',
          image: '/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp',
          category: 'kashpo',
          size: '16л',
          style: 'Классика',
        },
      ];

      for (const p of seedProducts) {
        await pool.query(
          `INSERT INTO products (id, name, description, image, category, size, style)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.description, p.image, p.category, p.size || null, p.style || null],
        );
      }

      sendJson(res, 200, {
        success: true,
        data: { kashpoCount: 3, rattanCount: 0, totalProducts: 3 },
      });
      return true;
    }

    if (method === 'GET' && path === '/get-data') {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, {
        success: true,
        data: {
          totalProducts: result.rows.length,
          products: result.rows.map(mapProductRow),
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('API error:', error);
    sendJson(res, 500, { success: false, error: 'Internal server error' });
    return true;
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname.startsWith(apiPrefix)) {
    const handled = await handleApi(request, response, requestUrl.pathname);
    if (handled) return;
  }

  const method = request.method || 'GET';
  const htmlPath = normalizeHtmlPathname(requestUrl.pathname);
  if (method === 'GET' && PRERENDER_HTML[htmlPath]) {
    const filePath = path.join(process.cwd(), 'build', PRERENDER_HTML[htmlPath]);
    try {
      const buf = await fs.readFile(filePath);
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.end(buf);
      return;
    } catch (err) {
      console.error('Prerender HTML read failed:', err.message);
    }
  }

  return handler(request, response, {
    public: 'build',
    cleanUrls: true,
    rewrites: [{ source: '**', destination: '/index.html' }],
    headers: [
      {
        source: '**/*.@(js|css|woff2|webp|avif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '**/*.@(svg|png|jpg|jpeg|gif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: 'index.html',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ],
  });
});

initializeDatabase()
  .then(() => {
    console.log('PostgreSQL initialized');
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize PostgreSQL:', error.message);
    process.exit(1);
  });
