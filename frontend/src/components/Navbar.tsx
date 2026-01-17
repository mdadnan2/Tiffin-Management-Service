"use client"
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, LayoutDashboard, UtensilsCrossed, User, Shield, Calendar, CalendarRange, Settings, BarChart3, Menu, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { User as UserType } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(auth.getUser());
  }, []);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tiffin
            </span>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    auth.clearAuth();
    router.push('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tiffin
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/meals">
              <Button variant="ghost" size="sm" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Meals
              </Button>
            </Link>
            <Link href="/meals/bulk">
              <Button variant="ghost" size="sm" className="gap-2">
                <CalendarRange className="h-4 w-4" />
                Bulk
              </Button>
            </Link>
            <Link href="/meals/calendar">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <div className="h-8 w-px bg-border mx-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{user?.name}</span>
            <ThemeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md p-8">
                <AlertDialogHeader className="space-y-4">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-bold">Logout Confirmation</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-center text-base pt-2">
                    <p className="text-foreground font-semibold text-lg">Are you sure you want to logout?</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                  <AlertDialogCancel className="w-full sm:w-auto m-0 h-11">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="w-full sm:w-auto m-0 h-11 bg-destructive hover:bg-destructive/90 font-semibold">
                    Yes, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t bg-background"
          >
            <div className="px-4 py-4 space-y-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/meals" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Meals
                </Button>
              </Link>
              <Link href="/meals/bulk" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Bulk Schedule
                </Button>
              </Link>
              <Link href="/meals/calendar" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Button>
              </Link>
              <Link href="/analytics" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-2 px-2">{user?.name}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md p-8">
                    <AlertDialogHeader className="space-y-4">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold">Logout Confirmation</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="text-center text-base pt-2">
                        <p className="text-foreground font-semibold text-lg">Are you sure you want to logout?</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                      <AlertDialogCancel onClick={() => setMobileMenuOpen(false)} className="w-full sm:w-auto m-0 h-11">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }} 
                        className="w-full sm:w-auto m-0 h-11 bg-destructive hover:bg-destructive/90 font-semibold"
                      >
                        Yes, Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
