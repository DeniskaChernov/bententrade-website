import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  X, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  ArrowRight,
  Loader2,
  Phone,
  UserPlus,
  Shield
} from '../utils/lucide-stub';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TelegramQuickFixWizardProps {
  isOpen: boolean;
  onClose: () => void;
  error?: any;
}

const BOT_USERNAME = '@zayavkassayta_bententrade_bot';
const BOT_TOKEN = '8344041596:AAEAJtbcpn8wVE_NcVpXAAbwrkvjE5GHZrA';
const CURRENT_CHAT_ID = '-1003068403630';

type Step = 1 | 2 | 3 | 4;

export function TelegramQuickFixWizard({ isOpen, onClose, error }: TelegramQuickFixWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [availableChats, setAvailableChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setAvailableChats([]);
      setSelectedChatId(null);
      setTestResults(new Map());
    }
  }, [isOpen]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[10000] transition-all duration-500 max-w-sm glass-effect ${
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
    }, 3000);
  };

  const searchForChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ee878259/telegram/chats`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.chats && data.chats.length > 0) {
        setAvailableChats(data.chats);
        setCurrentStep(3);
        showNotification(`✅ Найдено чатов: ${data.chats.length}`, 'success');
      } else if (data.success && data.chats && data.chats.length === 0) {
        setAvailableChats([]);
        setCurrentStep(2);
        showNotification('Чаты не найдены. Следуйте инструкциям ниже', 'error');
      } else {
        showNotification('Ошибка при поиске чатов', 'error');
      }
    } catch (error) {
      console.error('Error searching for chats:', error);
      showNotification('Ошибка подключения', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testChat = async (chatId: string) => {
    try {
      const testMessage = `🧪 Тестовое сообщение от Bententrade\n\nЭто автоматическая проверка связи.\nВремя: ${new Date().toLocaleString('ru-RU')}`;
      
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: 'HTML'
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setTestResults(new Map(testResults.set(chatId, true)));
        showNotification('✅ Сообщение отправлено! Проверьте Telegram', 'success');
        return true;
      } else {
        setTestResults(new Map(testResults.set(chatId, false)));
        showNotification('❌ Ошибка отправки', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error testing chat:', error);
      showNotification('❌ Ошибка подключения', 'error');
      return false;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('✅ Скопировано!', 'success');
  };

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  const StepIndicator = ({ step, label, isActive, isCompleted }: { 
    step: number; 
    label: string; 
    isActive: boolean; 
    isCompleted: boolean;
  }) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isCompleted 
          ? 'bg-green-400/20 text-green-400' 
          : isActive 
          ? 'bg-primary/20 text-primary neon-glow' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : step}
      </div>
      <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="glass-effect border-primary/20 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-400/10 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">🔧 Быстрое исправление</h2>
                    <p className="text-sm text-muted-foreground">Настройка Telegram за 3 минуты</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="mb-8 grid grid-cols-4 gap-2 sm:gap-4">
                <StepIndicator step={1} label="Поиск" isActive={currentStep === 1} isCompleted={currentStep > 1} />
                <StepIndicator step={2} label="Настройка" isActive={currentStep === 2} isCompleted={currentStep > 2} />
                <StepIndicator step={3} label="Выбор" isActive={currentStep === 3} isCompleted={currentStep > 3} />
                <StepIndicator step={4} label="Готово" isActive={currentStep === 4} isCompleted={false} />
              </div>

              {/* Step 1: Search for chats */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Alert className="border-red-400/20 bg-red-400/5">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <AlertDescription>
                      <div className="text-red-400 font-semibold mb-2">
                        ❌ Ошибка: Telegram чат не найден
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chat ID <code className="px-2 py-1 bg-black/20 rounded font-mono">{CURRENT_CHAT_ID}</code> не существует или бот не добавлен
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="text-center space-y-4 py-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold">Давайте найдем правильный чат!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Нажмите кнопку ниже, чтобы автоматически найти все чаты, где добавлен бот
                    </p>
                    
                    <Button
                      onClick={searchForChats}
                      disabled={isLoading}
                      className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 neon-glow"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Поиск чатов...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-3" />
                          Найти чаты автоматически
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-6">
                      Или <button onClick={() => setCurrentStep(2)} className="text-primary hover:underline">перейдите к настройке →</button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Setup instructions */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Alert className="border-amber-400/20 bg-amber-400/5">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <AlertDescription className="text-amber-400">
                      Чаты не найдены. Бот еще не получал сообщений. Следуйте инструкциям ниже:
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Card className="p-5 glass-card border-primary/10">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Шаг 1: Добавьте бота в группу
                      </h3>
                      
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="font-bold text-primary flex-shrink-0">1.</span>
                          <div>
                            <div className="font-medium mb-1">Откройте вашу Telegram группу</div>
                            <div className="text-xs text-muted-foreground">
                              Та группа, куда должны приходить заказы
                            </div>
                          </div>
                        </li>
                        
                        <li className="flex gap-3">
                          <span className="font-bold text-primary flex-shrink-0">2.</span>
                          <div>
                            <div className="font-medium mb-1">Добавьте бота</div>
                            <div className="text-xs text-muted-foreground mb-2">
                              Нажмите: Меню → Добавить участников → Найдите бота
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-1.5 bg-black/20 rounded font-mono text-xs">
                                {BOT_USERNAME}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(BOT_USERNAME)}
                                className="h-7"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </li>
                        
                        <li className="flex gap-3">
                          <span className="font-bold text-primary flex-shrink-0">3.</span>
                          <div>
                            <div className="font-medium mb-1">Сделайте бота администратором</div>
                            <div className="text-xs text-muted-foreground">
                              <strong className="text-amber-400">ВАЖНО:</strong> Включите право "Публикация сообщений"
                            </div>
                          </div>
                        </li>
                        
                        <li className="flex gap-3">
                          <span className="font-bold text-primary flex-shrink-0">4.</span>
                          <div>
                            <div className="font-medium mb-1">Отправьте любое сообщение в группу</div>
                            <div className="text-xs text-muted-foreground">
                              Например: "Тест"
                            </div>
                          </div>
                        </li>
                      </ol>

                      <Button
                        onClick={() => window.open(`https://t.me/${BOT_USERNAME.replace('@', '')}`, '_blank')}
                        className="w-full mt-4 rounded-xl"
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Открыть бота в Telegram
                      </Button>
                    </Card>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        ← Назад
                      </Button>
                      <Button
                        onClick={searchForChats}
                        disabled={isLoading}
                        className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Поиск...
                          </>
                        ) : (
                          <>
                            Проверить сейчас
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Select chat */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Alert className="border-green-400/20 bg-green-400/5">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <AlertDescription className="text-green-400">
                      ✅ Найдено чатов: {availableChats.length}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="font-semibold mb-4">Выберите правильный чат:</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableChats.map((chat) => {
                        const isSelected = selectedChatId === String(chat.id);
                        const testResult = testResults.get(String(chat.id));
                        const isCurrentChat = String(chat.id) === CURRENT_CHAT_ID;
                        
                        return (
                          <Card
                            key={chat.id}
                            className={`p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-green-400/40 bg-green-400/5'
                                : isCurrentChat
                                ? 'border-amber-400/40 bg-amber-400/5'
                                : 'border-primary/10 hover:border-primary/30'
                            }`}
                            onClick={() => setSelectedChatId(String(chat.id))}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium flex items-center gap-2 mb-1">
                                  <span className="truncate">{chat.title}</span>
                                  {testResult === true && (
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  )}
                                  {isCurrentChat && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-400 rounded flex-shrink-0">
                                      Настроенный
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <code className="px-1.5 py-0.5 bg-black/20 rounded font-mono">
                                    {chat.id}
                                  </code>
                                  <span>•</span>
                                  <span className="capitalize">{chat.type}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    testChat(String(chat.id));
                                  }}
                                  className="rounded-xl"
                                >
                                  Тест
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(String(chat.id));
                                  }}
                                  className="rounded-xl"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      ← Назад
                    </Button>
                    <Button
                      onClick={() => selectedChatId && setCurrentStep(4)}
                      disabled={!selectedChatId}
                      className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Продолжить
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Final instructions */}
              {currentStep === 4 && selectedChatId && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold mb-2">Почти готово!</h3>
                    <p className="text-muted-foreground">
                      Осталось обновить Chat ID в Supabase
                    </p>
                  </div>

                  <Card className="p-5 glass-card border-primary/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Ваш новый Chat ID:
                    </h3>
                    
                    <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl mb-4">
                      <code className="flex-1 font-mono text-lg text-primary">
                        {selectedChatId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedChatId)}
                        className="rounded-xl"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <h4 className="font-semibold">Инструкция для Supabase:</h4>
                      <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                        <li>Откройте Supabase Dashboard (кнопка ниже)</li>
                        <li>Перейдите: <strong>Settings → Edge Functions → Secrets</strong></li>
                        <li>Найдите переменную: <code className="px-2 py-0.5 bg-black/20 rounded">TELEGRAM_CHAT_ID</code></li>
                        <li>Вставьте новый ID: <code className="px-2 py-0.5 bg-black/20 rounded">{selectedChatId}</code></li>
                        <li>Нажмите <strong>Save</strong></li>
                      </ol>
                    </div>

                    <Button
                      onClick={openSupabase}
                      className="w-full mt-4 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Открыть Supabase Dashboard
                    </Button>
                  </Card>

                  <Alert className="border-green-400/20 bg-green-400/5">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <AlertDescription className="text-green-400">
                      <div className="font-semibold mb-1">✅ После обновления:</div>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Заказы будут приходить автоматически</li>
                        <li>• Проверьте отправкой тестового заказа</li>
                        <li>• Сохраните Chat ID на всякий случай</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      ← Назад
                    </Button>
                    <Button
                      onClick={onClose}
                      className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Готово! 🎉
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}