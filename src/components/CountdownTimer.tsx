import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiresAt: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiresAt) - +new Date();
      if (difference <= 0) return null;

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (!left) clearInterval(timer);
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) return <span className="text-gray-400 text-xs font-bold">انتهى العرض</span>;

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold" dir="ltr">
      <div className="bg-brand-red text-white px-1.5 py-0.5 rounded">
        {timeLeft.hours.toString().padStart(2, '0')}
      </div>
      <span className="text-brand-red">:</span>
      <div className="bg-brand-red text-white px-1.5 py-0.5 rounded">
        {timeLeft.minutes.toString().padStart(2, '0')}
      </div>
      <span className="text-brand-red">:</span>
      <div className="bg-brand-red text-white px-1.5 py-0.5 rounded">
        {timeLeft.seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};
