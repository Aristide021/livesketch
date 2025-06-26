import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <span className="text-lg font-bold text-gray-800">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${
            percentage > 30 ? 'bg-green-500' : percentage > 10 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {timeLeft <= 10 && timeLeft > 0 && (
        <div className="text-center mt-2">
          <span className={`text-red-600 font-bold animate-pulse ${timeLeft <= 5 ? 'text-xl' : ''}`}>
            {timeLeft <= 5 ? 'HURRY UP!' : 'Time running out!'}
          </span>
        </div>
      )}
    </div>
  );
};