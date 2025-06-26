import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: Date;
  type: 'guess' | 'chat' | 'system';
  isCorrect?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, type: 'guess' | 'chat') => void;
  currentPlayerId: string;
  isGuessingPhase: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  currentPlayerId,
  isGuessingPhase
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage(inputValue.trim(), isGuessingPhase ? 'guess' : 'chat');
    setInputValue('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg backdrop-blur-sm bg-opacity-90 flex flex-col h-96">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
          {isGuessingPhase ? 'Guesses & Chat' : 'Chat'}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 rounded-lg max-w-xs ${
              message.playerId === currentPlayerId
                ? 'ml-auto bg-blue-500 text-white'
                : message.type === 'system'
                ? 'bg-gray-100 text-gray-600 text-center mx-auto text-sm'
                : message.type === 'guess' && message.isCorrect
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : message.type === 'guess'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.type !== 'system' && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-75">
                  {message.playerName}
                </span>
                <span className="text-xs opacity-50">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
            
            <p className={`text-sm ${message.type === 'system' ? 'font-medium' : ''}`}>
              {message.content}
              {message.type === 'guess' && message.isCorrect && ' 🎉'}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isGuessingPhase ? "Enter your guess..." : "Type a message..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};