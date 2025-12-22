'use client';

import { useState } from 'react';
import { Session, sessionsApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddItemModalProps {
  session: Session;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({
  session,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !quantity) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sessionsApi.addItem(session.id, {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      });
      onItemAdded();
      toast({
        title: "Товар добавлен",
        description: `${name} успешно добавлен`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось добавить товар',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const itemsTotal = session.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Добавить еду или напиток</DialogTitle>
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
            Добавить товары к текущей сессии
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Название товара
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Cola, Pizza, Chips"
              required
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Цена (сом)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Количество
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {session.items.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Текущие товары
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {session.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0"
                    >
                      <span className="text-gray-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} сом
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-300 font-semibold text-base">
                  <span className="text-gray-700">Итого:</span>
                  <span className="text-gray-900">{itemsTotal.toFixed(2)} сом</span>
                </div>
              </CardContent>
            </Card>
          )}

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
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              {loading ? 'Добавление...' : 'Добавить товар'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
