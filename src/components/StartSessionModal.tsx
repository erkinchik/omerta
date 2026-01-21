'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Clock } from 'lucide-react';

interface StartSessionModalProps {
  stationName: string;
  stationType: 'COMMON_HALL' | 'CABIN';
  onClose: () => void;
  onStart: (startTime: string | undefined, durationMinutes: number | undefined) => void;
}

export default function StartSessionModal({
  stationName,
  stationType,
  onClose,
  onStart,
}: StartSessionModalProps) {
  // Default to current date and time
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

  const [startDateTime, setStartDateTime] = useState(defaultDate);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [useDuration, setUseDuration] = useState(true);

  // Calculate end time preview
  const calculateEndTime = () => {
    if (!useDuration) return null;
    
    const start = new Date(startDateTime);
    const durationMs = (parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);
    return end;
  };

  const endTime = calculateEndTime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hours and minutes
    const hoursNum = parseInt(hours);
    const minutesNum = parseInt(minutes);
    
    if (useDuration && (hoursNum < 0 || minutesNum < 0 || (hoursNum === 0 && minutesNum === 0))) {
      return;
    }

    const startTimeISO = startDateTime ? new Date(startDateTime).toISOString() : undefined;
    const durationMinutes = useDuration 
      ? hoursNum * 60 + minutesNum 
      : undefined;

    onStart(startTimeISO, durationMinutes);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Начать сессию с параметрами</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Настройка времени для {stationName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Время начала
            </label>
            <Input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Если не указано, будет использовано текущее время
            </p>
          </div>

          {/* Duration Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useDuration"
              checked={useDuration}
              onChange={(e) => setUseDuration(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="useDuration" className="text-sm font-medium text-gray-700">
              Установить длительность сессии
            </label>
          </div>

          {/* Duration Input */}
          {useDuration && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Длительность
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Часы</label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 23)) {
                        setHours(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Минуты</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                        setMinutes(val);
                      }
                    }}
                    placeholder="30"
                    className="w-full"
                  />
                </div>
              </div>
              {endTime && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Время окончания:</span>{' '}
                    {endTime.toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              {useDuration
                ? 'Сессия автоматически завершится через указанное время.'
                : 'Сессия будет продолжаться до ручной остановки.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Начать сессию
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
