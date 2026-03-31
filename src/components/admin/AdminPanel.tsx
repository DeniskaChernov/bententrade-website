import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  LogOut, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database
} from '../../utils/lucide-stub';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { TelegramStatusIndicator } from '../TelegramStatusIndicator';
import { DataLoader } from '../DataLoader';

interface OrderItem {
  name: string;
  quantity: number;
  variant?: string;
  size?: string;
  style?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  language: 'uz' | 'ru';
  createdAt: string;
  updatedAt: string;
  telegramMessageId?: string;
}

interface Stats {
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  archivedOrders: number;
}

interface AdminPanelProps {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [dbHealthy, setDbHealthy] = useState(true);
  const [dbWarning, setDbWarning] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'database' | 'in-memory'>('database');

  // Загрузка данных
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Загружаем заказы и статистику параллельно
      const [ordersResponse, statsResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ee878259/orders`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ee878259/stats`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }),
      ]);

      if (ordersResponse.ok && statsResponse.ok) {
        const ordersData = await ordersResponse.json();
        const statsData = await statsResponse.json();
        
        // Определяем режим хранилища
        const mode = ordersData.storageMode || statsData.storageMode || 'database';
        setStorageMode(mode);
        
        // Проверяем наличие ошибок (не warnings)
        if (ordersData.error || statsData.error) {
          const error = ordersData.error || statsData.error;
          setDbHealthy(false);
          setDbWarning(error);
          showNotification(error, 'error');
        } else {
          // Всё работает нормально - режим in-memory это не ошибка!
          setDbHealthy(true);
          setDbWarning(null);
        }
        
        setOrders(ordersData.orders || []);
        setStats(statsData.stats);
      } else {
        throw new Error('Не удалось загрузить данные');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setDbHealthy(false);
      setStorageMode('in-memory');
      setDbWarning('Не удалось подключиться к серверу');
      showNotification(
        'Ошибка подключения к серверу. Проверьте интернет-соединение.',
        'error'
      );
      // Устанавливаем пустые значения по умолчанию
      setOrders([]);
      setStats({
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        archivedOrders: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ee878259/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
            : order
        ));
        
        // Показываем уведомление
        showNotification(`Статус заказа ${orderId} изменен на "${getStatusLabel(newStatus)}"`, 'success');
        
        // Перезагружаем статистику
        fetchData();
      } else {
        showNotification('Ошибка при обновлении статуса заказа', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Ошибка при обновлении статуса заказа', 'error');
    }
  };

  // Удаление заказа
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ee878259/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        showNotification(`Заказ ${orderId} удален`, 'success');
        fetchData();
      } else {
        showNotification('Ошибка при удалении заказа', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification('Ошибка при удалении заказа', 'error');
    }
  };

  // Показать уведомление
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect ${
      type === 'success' 
        ? 'border-green-400/20 text-green-400' 
        : type === 'error'
          ? 'border-red-400/20 text-red-400'
          : 'border-blue-400/20 text-blue-400'
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

  // Получение метки статуса
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён'
    };
    return labels[status] || status;
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Статистические карточки
  const statsCards = stats ? [
    {
      title: 'Всего заказов',
      value: stats.totalOrders.toString(),
      change: `+${stats.pendingOrders} новых`,
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-primary'
    },
    {
      title: 'Активные заказы',
      value: stats.activeOrders.toString(),
      change: `${stats.pendingOrders} ожидают`,
      trend: 'up',
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      title: 'В работе',
      value: stats.processingOrders.toString(),
      change: 'Обрабатываются',
      trend: 'up',
      icon: Settings,
      color: 'text-orange-400'
    },
    {
      title: 'Завершённые',
      value: stats.completedOrders.toString(),
      change: 'Выполнено',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-400'
    }
  ] : [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Ожидает', icon: Clock },
      processing: { variant: 'default', label: 'В работе', icon: Settings },
      completed: { variant: 'outline', label: 'Завершён', icon: CheckCircle },
      cancelled: { variant: 'destructive', label: 'Отменён', icon: XCircle }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderSummary = (items: OrderItem[]) => {
    if (items.length === 1) {
      return items[0].name;
    }
    return `${items[0].name} + еще ${items.length - 1} товаров`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-primary/10 glass-effect shadow-sm"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow"
            >
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-grotesk">Админ-панель</h1>
              <p className="text-sm text-muted-foreground">Bententrade Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
                disabled={refreshing}
                className="glass-card border-primary/20 hover:border-primary/40"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Обновить
              </Button>
            </motion.div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="glass-card border-primary/20 hover:border-primary/40"
            >
              <Bell className="w-4 h-4 mr-2" />
              Уведомления
              {notifications > 0 && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground neon-glow">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onExit}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-1" />
              Данные
            </TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Storage Mode Info - показываем только если БД не настроена И есть заказы */}
            {storageMode === 'in-memory' && stats && stats.totalOrders > 5 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border-blue-400/30 p-6 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-400/10 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2 font-grotesk">
                      Рекомендация: настройте постоянное хранилище
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      У вас уже {stats.totalOrders} заказов! Для сохранения истории между перезапусками настройте базу данных (займёт 2 минуты).
                    </p>
                    <div className="mt-4 flex items-start gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-primary">
                        <strong>Все функции работают!</strong> Заказы отправляются в Telegram. 
                        БД нужна только для долгосрочного хранения.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="glass-card animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground font-grotesk">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-foreground font-grotesk">Последние заказы</CardTitle>
                  <CardDescription>Актуальные заказы клиентов</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-border rounded-xl animate-pulse">
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                          <div className="h-8 bg-muted rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Заказов пока нет</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Новые заказы будут отображаться здесь
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {orders.slice(0, 5).map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-4 glass-card rounded-xl hover:border-primary/30 transition-all duration-300"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-primary font-grotesk">{order.id}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.customerInfo.name} • {order.customerInfo.phone}
                              </p>
                              <p className="text-sm text-foreground mt-1">
                                {getOrderSummary(order.items)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setActiveTab('orders')}
                                  className="glass-card border-primary/20 hover:border-primary/40"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                {order.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="glass-card border-blue-400/20 hover:border-blue-400/40 text-blue-400 hover:text-blue-400"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                )}
                                {order.status === 'processing' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                    className="glass-card border-green-400/20 hover:border-green-400/40 text-green-400 hover:text-green-400"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {orders.length > 5 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center pt-4"
                        >
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('orders')}
                            className="glass-card border-primary/20 hover:border-primary/40"
                          >
                            Показать все заказы ({orders.length})
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-grotesk">Управление товарами</CardTitle>
                    <CardDescription>Добавление, редактирование и удаление товаров</CardDescription>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить товар
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Package className="w-20 h-20 text-primary mx-auto mb-6 opacity-60" />
                    </motion.div>
                    <h3 className="text-xl font-grotesk text-gradient mb-4">Функционал в разработке</h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-balance">
                      Скоро здесь будет полнофункциональная система управления товарами с добавлением, редактированием и удалением
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-grotesk">Управление заказами</CardTitle>
                    <CardDescription>Обработка и отслеживание всех заказов</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                      disabled={refreshing}
                      className="glass-card border-primary/20 hover:border-primary/40"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Обновить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 border border-border rounded-xl animate-pulse">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                              <div className="h-4 bg-muted rounded w-48"></div>
                            </div>
                            <div className="h-6 bg-muted rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-muted rounded w-full mb-2"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">Заказов пока нет</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Новые заказы будут отображаться здесь
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence>
                        {orders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="p-6 glass-card rounded-2xl hover:border-primary/30 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-primary font-grotesk">{order.id}</h3>
                                  {getStatusBadge(order.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Создан: {formatDate(order.createdAt)}
                                  {order.updatedAt !== order.createdAt && (
                                    <span> • Обновлен: {formatDate(order.updatedAt)}</span>
                                  )}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                {order.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'processing')}
                                      className="glass-card border-blue-400/20 hover:border-blue-400/40 text-blue-400 hover:text-blue-400"
                                    >
                                      <Settings className="w-4 h-4 mr-1" />
                                      В работу
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Отмнить
                                    </Button>
                                  </>
                                )}
                                
                                {order.status === 'processing' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'completed')}
                                      className="glass-card border-green-400/20 hover:border-green-400/40 text-green-400 hover:text-green-400"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Завершить
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Отменить
                                    </Button>
                                  </>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteOrder(order.id)}
                                  className="glass-card border-red-400/20 hover:border-red-400/40 text-red-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Информация о клиенте */}
                              <div>
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  Информация о клиенте
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-muted-foreground">Имя:</span> {order.customerInfo.name}</p>
                                  <p><span className="text-muted-foreground">Телефон:</span> {order.customerInfo.phone}</p>
                                  {order.customerInfo.email && (
                                    <p><span className="text-muted-foreground">Email:</span> {order.customerInfo.email}</p>
                                  )}
                                  {order.customerInfo.address && (
                                    <p><span className="text-muted-foreground">Адрес:</span> {order.customerInfo.address}</p>
                                  )}
                                  {order.customerInfo.notes && (
                                    <p><span className="text-muted-foreground">Комментарий:</span> {order.customerInfo.notes}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Товары */}
                              <div>
                                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-primary" />
                                  Заказанные товары ({order.items.length})
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="p-3 glass-effect rounded-xl">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium text-foreground">{item.name}</p>
                                          <div className="flex gap-2 mt-1">
                                            {item.variant && (
                                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                Цвет: {item.variant}
                                              </Badge>
                                            )}
                                            {item.size && (
                                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                {item.size}
                                              </Badge>
                                            )}
                                            {item.style && (
                                              <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                                                {item.style}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20">
                                          {item.quantity} шт
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Data Loader Tab */}
          <TabsContent value="data" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DataLoader />
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Telegram Status Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TelegramStatusIndicator 
                showTestButton={true}
                onOpenSetup={() => {
                  window.dispatchEvent(new CustomEvent('openTelegramSetup'));
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-foreground font-grotesk">Настройки системы</CardTitle>
                  <CardDescription>Конфигурация сайта и админ-панели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">

                    {/* Server Settings */}
                    <Card className="glass-effect border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-base">Сервер и хранилище</CardTitle>
                        <CardDescription>Состояние серверной части</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Сервер:</span>
                            <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                              ✓ Работает
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Режим хранения:</span>
                            {storageMode === 'database' ? (
                              <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                                База данных
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                                Оперативная память
                              </Badge>
                            )}
                          </div>
                          {storageMode === 'in-memory' && (
                            <div className="p-3 bg-blue-400/10 rounded-xl border border-blue-400/20 mt-3">
                              <p className="text-xs text-blue-400 mb-2">
                                💡 Данные временные. Для постоянного хранения настройте БД
                              </p>
                              <a 
                                href="https://supabase.com/dashboard/project/mvrljchbupekmuhryvlw/sql/new" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-block"
                              >
                                Инструкция по настройке (2 мин) →
                              </a>
                            </div>
                          )}
                          {!dbHealthy && dbWarning && (
                            <div className="p-3 bg-red-400/10 rounded-xl border border-red-400/20 mt-3">
                              <p className="text-xs text-red-400">
                                ⚠️ {dbWarning}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Версия API:</span>
                            <span className="text-xs font-mono">v2.0.0</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Telegram:</span>
                            <Badge className="bg-green-500/10 text-green-400 border-green-400/20">
                              ✓ Активен
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8 text-center">
                    <motion.div
                      animate={{ 
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    >
                      <Settings className="w-16 h-16 text-primary mx-auto mb-4 opacity-60" />
                    </motion.div>
                    <h3 className="text-lg font-grotesk text-gradient mb-2">Расширенные настройки</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto text-balance">
                      Дополнительные параметры конфигурации будут добавлены в следующих обновлениях
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}