// src/hooks/useSessionTimeout.ts
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SessionTimeoutConfig {
  sessionDuration: number; // 24 hours in milliseconds
  warningTime: number; // 30 minutes in milliseconds
}

export const useSessionTimeout = (config?: Partial<SessionTimeoutConfig>) => {
  const { session, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const sessionTimer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();
  const countdownTimer = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());
  
  const defaultConfig: SessionTimeoutConfig = {
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
    warningTime: 30 * 60 * 1000, // 30 minutes
  };
  
  const finalConfig = { ...defaultConfig, ...config };

  const clearAllTimers = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  const handleSessionExpired = async () => {
    clearAllTimers();
    setShowWarning(false);
    await signOut();
  };

  const handleExtendSession = () => {
    setShowWarning(false);
    setTimeRemaining(0);
    clearAllTimers();
    lastActivityRef.current = Date.now();
    startSessionTimeout();
  };

  const startCountdown = () => {
    setTimeRemaining(finalConfig.warningTime);
    
    countdownTimer.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          handleSessionExpired();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  const startSessionTimeout = () => {
    if (!session) return;
    
    clearAllTimers();
    
    // Set timer for showing warning
    const warningDelay = finalConfig.sessionDuration - finalConfig.warningTime;
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningDelay);
    
    // Set timer for automatic logout
    sessionTimer.current = setTimeout(() => {
      handleSessionExpired();
    }, finalConfig.sessionDuration);
  };

  // Track user activity to reset timers
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (session && !showWarning) {
        startSessionTimeout();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const throttledUpdate = throttle(updateActivity, 30000); // Throttle to every 30 seconds
    
    events.forEach(event => document.addEventListener(event, throttledUpdate, true));

    return () => {
      events.forEach(event => document.removeEventListener(event, throttledUpdate, true));
    };
  }, [session, showWarning]);

  // Start timeout when user logs in
  useEffect(() => {
    if (session) {
      lastActivityRef.current = Date.now();
      startSessionTimeout();
    } else {
      clearAllTimers();
      setShowWarning(false);
    }

    return () => clearAllTimers();
  }, [session]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    showWarning,
    timeRemaining: formatTimeRemaining(timeRemaining),
    handleExtendSession,
    handleSessionExpired,
  };
};

// Simple throttle utility
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}