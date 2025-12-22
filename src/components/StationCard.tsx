'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ShoppingCart, Loader2 } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  type: 'COMMON_HALL' | 'CABIN';
  consoleType: 'PS3' | 'PS5';
}

interface StationCardProps {
  station: Station;
  activeSession?: Session;
  isStopping?: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddItem: () => void;
}

export default function StationCard({
  station,
  activeSession,
  isStopping = false,
  onStart,
  onStop,
  onAddItem,
}: StationCardProps) {
  const isActive = !!activeSession;

  const getElapsedTime = () => {
    if (!activeSession) return '00:00:00';
    const start = new Date(activeSession.startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [elapsedTime, setElapsedTime] = useState(getElapsedTime());

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, activeSession]);

  const itemsTotal = activeSession?.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  ) || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-white/20 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {station.name} - {station.consoleType}
          </CardTitle>
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? '● Активна' : '○ Неактивна'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isActive && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Прошедшее время</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 font-mono">
                {elapsedTime}
              </span>
            </div>
            {itemsTotal > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">Итого товаров</span>
                </div>
                <span className="text-lg font-semibold text-green-600 shrink-0">
                  {itemsTotal.toFixed(2)} сом
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {!isActive ? (
            <Button
              onClick={onStart}
              className="flex-1 min-w-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md text-xs sm:text-sm px-2"
            >
              <span className="truncate">Начать сессию</span>
            </Button>
          ) : (
            <>
              <Button
                onClick={onStop}
                variant="destructive"
                disabled={isStopping}
                className="flex-1 min-w-0 shadow-md text-xs sm:text-sm px-2"
              >
                {isStopping ? (
                  <span className="flex items-center gap-2 truncate">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span className="truncate">Загрузка...</span>
                  </span>
                ) : (
                  <span className="truncate">Остановить</span>
                )}
              </Button>
              <Button
                onClick={onAddItem}
                variant="default"
                disabled={isStopping}
                className="flex-1 min-w-0 shadow-md text-xs sm:text-sm px-2"
              >
                <span className="truncate">Добавить</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
