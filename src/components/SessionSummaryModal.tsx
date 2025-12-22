'use client';

import { Session } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Gamepad2, ShoppingCart, X } from 'lucide-react';

interface SessionSummaryModalProps {
  session: Session | null;
  onClose: () => void;
}

export default function SessionSummaryModal({
  session,
  onClose,
}: SessionSummaryModalProps) {
  if (!session || !session.endTime) return null;

  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationMinutes = Math.round(durationMs / (1000 * 60));

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${mins} мин`;
    }
    return `${mins} мин`;
  };

  // Get play time price from session or calculate from totalBill - itemsTotal
  const itemsTotal = session.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const playTimePrice = session.playTimePrice || ((session.totalBill || 0) - itemsTotal);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Сессия завершена
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Station Info */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-blue-600" />
                {session.stationId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Тип: {session.type === 'COMMON_HALL' ? 'Общий зал' : 'Кабина'}
              </div>
            </CardContent>
          </Card>

          {/* Time Info */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                Время сессии
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Дата:</span>
                <span className="font-medium">{formatDate(startTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Начало:</span>
                <span className="font-medium">{formatTime(startTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Окончание:</span>
                <span className="font-medium">{formatTime(endTime)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-semibold">Длительность:</span>
                <span className="font-bold text-lg">{formatDuration(durationMinutes)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Детализация счета
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Стоимость игры:</span>
                <span className="font-medium">{playTimePrice.toFixed(2)} сом</span>
              </div>
              {session.items.length > 0 && (
                <>
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <ShoppingCart className="h-4 w-4" />
                      Товары:
                    </div>
                    <div className="space-y-1 pl-6">
                      {session.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toFixed(2)} сом
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-green-200 mt-2">
                      <span className="text-gray-600">Итого товаров:</span>
                      <span className="font-medium">{itemsTotal.toFixed(2)} сом</span>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base pt-3 border-t-2 border-green-300 mt-3">
                <span className="font-bold text-gray-900">К ОПЛАТЕ:</span>
                <span className="font-bold text-2xl text-green-600">
                  {session.totalBill?.toFixed(2) || '0.00'} сом
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="min-w-[120px]">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

