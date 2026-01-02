'use client';

import { useEffect, useState } from 'react';
import { getLoadingMessages } from '@/lib/copy';

export function LoadingState() {
  const messages = getLoadingMessages();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-lg text-gray-600 font-medium animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
