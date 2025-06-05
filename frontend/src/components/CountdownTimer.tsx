"use client";

import { FC, useEffect, useState } from "react";

interface Props {
  targetDate: Date;
}

const CountdownTimer: FC<Props> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const diff = targetDate.getTime() - new Date().getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="text-sm text-red-500">Événement en cours</span>;
  }

  return (
    <div className="text-sm text-yellow-300">
      <span>{timeLeft.days}j </span>
      <span>{timeLeft.hours}h </span>
      <span>{timeLeft.minutes}m </span>
      <span>{timeLeft.seconds}s</span>
    </div>
  );
};

export default CountdownTimer;
