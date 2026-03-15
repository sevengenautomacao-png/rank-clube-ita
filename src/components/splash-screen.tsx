"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  clubName?: string;
  onFinish?: () => void;
}

export function SplashScreen({ clubName = "ITA", onFinish }: SplashScreenProps) {
  const { fontClassName } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation
    const timer = setTimeout(() => {
        setIsAnimating(true);
    }, 100);

    // Duration of splash
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out",
      isAnimating ? "opacity-100" : "opacity-0",
      !isVisible && "opacity-0 pointer-events-none"
    )}>
      <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/20 animate-pulse">
            <span className={cn("text-3xl sm:text-4xl font-bold text-primary-foreground", fontClassName)}>
                {clubName[0]}
            </span>
        </div>
        
        <div className="text-center space-y-2">
            <h2 className={cn("text-xl sm:text-2xl font-bold tracking-widest text-muted-foreground uppercase", fontClassName)}>
                CLUBE
            </h2>
            <h1 className={cn("text-4xl sm:text-6xl font-black text-primary tracking-tighter uppercase", fontClassName)}>
                {clubName}
            </h1>
        </div>

        <div className="absolute -bottom-12 w-48 h-1 bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-progress duration-[2500ms] ease-linear"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2.5s linear;
        }
      `}</style>
    </div>
  );
}
