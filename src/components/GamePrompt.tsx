import React from 'react';
import { Lightbulb, Eye, EyeOff } from 'lucide-react';

interface GamePromptProps {
  prompt: string;
  isVisible: boolean;
  isMyTurn: boolean;
}

export const GamePrompt: React.FC<GamePromptProps> = ({ prompt, isVisible, isMyTurn }) => {
  if (!isMyTurn && !isVisible) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <EyeOff className="w-5 h-5" />
          <span className="font-medium">Hidden until round ends</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 backdrop-blur-sm bg-opacity-90 ${isMyTurn ? 'border-2 border-blue-300' : ''}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Lightbulb className={`w-5 h-5 ${isMyTurn ? 'text-blue-500' : 'text-gray-500'}`} />
        <span className="font-medium text-gray-700">
          {isMyTurn ? 'Your Drawing Prompt:' : 'The Prompt Was:'}
        </span>
      </div>
      
      <div className={`text-center p-4 rounded-lg ${isMyTurn ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
        <p className={`text-xl font-bold ${isMyTurn ? 'text-blue-700' : 'text-gray-700'}`}>
          {prompt}
        </p>
        {isMyTurn && (
          <p className="text-sm text-blue-600 mt-2">
            Draw this for others to guess!
          </p>
        )}
      </div>
    </div>
  );
};