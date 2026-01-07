'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Coffee, Soup, Moon, Sparkles, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const mealIcons = {
  BREAKFAST: Coffee,
  LUNCH: Soup,
  DINNER: Moon,
  CUSTOM: Sparkles,
};

const getMealColor = (type: string) => {
  switch(type) {
    case 'BREAKFAST': return 'bg-orange-500';
    case 'LUNCH': return 'bg-green-500';
    case 'DINNER': return 'bg-blue-500';
    case 'CUSTOM': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, [currentMonth]);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const { data } = await api.meals.getCalendar({ month });
      setCalendarData(data);
    } catch (err: any) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            Meal Calendar
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm sm:text-base min-w-[140px] sm:min-w-[180px] text-center">{monthName}</span>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Day Status</p>
            <div className="flex items-center gap-3 sm:gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500"></div>
                <span className="text-xs sm:text-sm font-medium">Consumed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-500"></div>
                <span className="text-xs sm:text-sm font-medium">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-500"></div>
                <span className="text-xs sm:text-sm font-medium">Scheduled</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Meal Types</p>
            <div className="flex items-center gap-3 sm:gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium">Breakfast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium">Lunch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium">Dinner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-xs font-medium">Custom</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <motion.div 
                key={day}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="text-center font-bold text-[10px] sm:text-xs lg:text-sm py-1 sm:py-2 text-slate-700 dark:text-slate-400 bg-slate-300 dark:bg-slate-800 rounded-lg"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </motion.div>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square bg-gray-200 dark:bg-gray-800/50 rounded-lg" />;
              }

              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const meals = calendarData[dateStr] || [];
              const today = new Date().toISOString().split('T')[0];
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const isFuture = dateStr > today;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index + 7) * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`aspect-square border-2 rounded-lg p-1 hover:shadow-lg transition-all cursor-pointer ${
                    isToday 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' 
                      : isPast && meals.length > 0
                      ? 'border-green-500 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                      : isFuture && meals.length > 0
                      ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30'
                      : 'border-gray-400 dark:border-gray-700 bg-gray-300 dark:bg-gray-800'
                  }`}
                >
                  <div className="text-[10px] sm:text-xs font-semibold mb-0.5">{day}</div>
                  {meals.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {meals.slice(0, 3).map((meal, idx) => {
                        const Icon = mealIcons[meal.mealType as keyof typeof mealIcons];
                        return (
                          <div
                            key={idx}
                            className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${getMealColor(meal.mealType)}`}
                            title={`${meal.mealType}: ${meal.count}x ₹${meal.priceAtTime}`}
                          />
                        );
                      })}
                      {meals.length > 3 && (
                        <div className="text-[8px] sm:text-[9px] font-bold">+{meals.length - 3}</div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
