'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { setAuthToken } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CalendarView from '@/components/CalendarView';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setAuthToken(token);
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-2xl flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 sm:h-7 w-6 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Meal Calendar
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                  View your meals in calendar format
                </p>
              </div>
            </div>

            <CalendarView />
          </motion.div>
        </div>
      </main>
    </>
  );
}
