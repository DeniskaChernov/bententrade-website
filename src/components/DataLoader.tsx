import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, Loader2, Database, RefreshCw } from '../utils/lucide-stub';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DataLoader() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ee878259/load-data`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        console.log('✅ Данные успешно загружены:', data);
      } else {
        throw new Error(data.error || data.message || 'Неизвестная ошибка');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
      setError(errorMessage);
      console.error('❌ Ошибка:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkData = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ee878259/get-data`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        console.log('✅ Данные получены:', data);
      } else {
        throw new Error(data.error || data.message || 'Неизвестная ошибка');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения данных';
      setError(errorMessage);
      console.error('❌ Ошибка:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="w-6 h-6 text-primary" />
            Загрузка данных в Supabase
          </CardTitle>
          <CardDescription className="text-base">
            Загрузите актуальные данные каталога в Supabase KV Store
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={loadData}
              disabled={loading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Загрузить данные
            </Button>

            <Button
              onClick={checkData}
              disabled={loading}
              variant="outline"
              className="gap-2 border-primary/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Проверить данные
            </Button>
          </div>

          {/* Результат */}
          {result && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-400 mb-2">Успешно!</p>
                  
                  {result.data && (
                    <div className="space-y-2 text-sm text-foreground/80">
                      {result.data.kashpoCount !== undefined && (
                        <p>• Кашпо: {result.data.kashpoCount} товаров</p>
                      )}
                      {result.data.rattanCount !== undefined && (
                        <p>• Ротанговая нить: {result.data.rattanCount} профилей</p>
                      )}
                      {result.data.totalProducts !== undefined && (
                        <p className="font-medium text-primary">
                          Всего загружено: {result.data.totalProducts} товаров
                        </p>
                      )}

                      {/* Показываем данные при проверке */}
                      {result.data.kashpo && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-primary hover:text-primary/80">
                            Показать все данные
                          </summary>
                          <pre className="mt-2 p-3 bg-background/50 rounded-lg overflow-auto text-xs max-h-96">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ошибка */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-400 mb-1">Ошибка</p>
                  <p className="text-sm text-foreground/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Информация */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h3 className="font-medium mb-3">📦 Что загружается:</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• <strong>Кашпо (5 товаров)</strong>: 120,000 / 187,000 / 245,000 сум</li>
              <li>• <strong>Ротанговая нить (4 профиля)</strong>: 36,000 сум/кг (мин. 5кг)</li>
              <li>• <strong>Цены</strong>: актуальные на все товары</li>
              <li>• <strong>Контакты</strong>: телефон, email, адрес, график работы</li>
              <li>• <strong>Переводы</strong>: русский и узбекский языки</li>
            </ul>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 Загрузка данных перезаписывает все существующие данные в KV Store</p>
            <p>🔄 Перезагружайте данные после изменения цен или добавления товаров</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
