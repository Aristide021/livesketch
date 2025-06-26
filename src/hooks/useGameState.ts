import { useState, useCallback, useEffect } from 'react';

export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: Date;
  type: 'guess' | 'chat' | 'system';
  isCorrect?: boolean;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  currentArtist: string;
  currentPrompt: string;
  timeLeft: number;
  phase: 'waiting' | 'drawing' | 'guessing' | 'results' | 'finished';
  roundStartTime: Date | null;
}

const DRAWING_PROMPTS = [
  'Cat sleeping on a windowsill',
  'Person riding a bicycle',
  'Sunset over mountains',
  'Birthday cake with candles',
  'Robot playing guitar',
  'Butterfly on a flower',
  'Pirate ship on the ocean',
  'Dragon breathing fire',
  'Ice cream cone',
  'Superhero flying',
  'House with a garden',
  'Elephant at the zoo',
  'Spaceship landing on Mars',
  'Chef cooking pasta',
  'Owl sitting on a branch',
  'Beach with palm trees',
  'Knight on a horse',
  'Raindrops on a window',
  'Dog playing fetch',
  'Wizard casting a spell'
];

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-red-400 to-red-600',
  'from-yellow-400 to-yellow-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600'
];

const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];

export const useGameState = () => {
  const [currentPlayerId] = useState('player-1');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player-1',
      name: 'You',
      score: 0,
      avatar: AVATAR_COLORS[0],
      isOnline: true
    },
    {
      id: 'bot-1',
      name: BOT_NAMES[0],
      score: 0,
      avatar: AVATAR_COLORS[1],
      isOnline: true
    },
    {
      id: 'bot-2',
      name: BOT_NAMES[1],
      score: 0,
      avatar: AVATAR_COLORS[2],
      isOnline: true
    },
    {
      id: 'bot-3',
      name: BOT_NAMES[2],
      score: 0,
      avatar: AVATAR_COLORS[3],
      isOnline: true
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      playerId: 'system',
      playerName: 'System',
      content: 'Welcome to LiveSketch Battle! Get ready to draw and guess!',
      timestamp: new Date(),
      type: 'system'
    }
  ]);

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 8,
    currentArtist: 'player-1',
    currentPrompt: DRAWING_PROMPTS[0],
    timeLeft: 90,
    phase: 'drawing',
    roundStartTime: new Date()
  });

  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [correctGuessers, setCorrectGuessers] = useState<Set<string>>(new Set());

  const addMessage = useCallback((content: string, type: 'guess' | 'chat' | 'system', playerId?: string, isCorrect?: boolean) => {
    const player = players.find(p => p.id === (playerId || currentPlayerId));
    const newMessage: Message = {
      id: Date.now().toString(),
      playerId: playerId || currentPlayerId,
      playerName: player?.name || 'Unknown',
      content,
      timestamp: new Date(),
      type,
      isCorrect
    };
    setMessages(prev => [...prev, newMessage]);
  }, [players, currentPlayerId]);

  const checkGuess = useCallback((guess: string): boolean => {
    const prompt = gameState.currentPrompt.toLowerCase();
    const guessLower = guess.toLowerCase();
    
    const keywords = prompt.split(' ').filter(word => word.length > 2);
    const hasKeyword = keywords.some(keyword => guessLower.includes(keyword));
    const isExactMatch = guessLower === prompt;
    
    return isExactMatch || hasKeyword;
  }, [gameState.currentPrompt]);

  const simulateBotGuesses = useCallback(() => {
    if (gameState.phase !== 'drawing' || gameState.currentArtist === currentPlayerId) return;

    const botPlayers = players.filter(p => p.id !== currentPlayerId && p.id !== gameState.currentArtist && !correctGuessers.has(p.id));
    
    if (botPlayers.length === 0) return;

    const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
    const timeElapsed = gameState.roundStartTime ? (Date.now() - gameState.roundStartTime.getTime()) / 1000 : 0;
    
    // Bots become more likely to guess correctly as time passes
    const correctChance = Math.min(timeElapsed / 60, 0.8); // Max 80% chance after 60 seconds
    
    if (Math.random() < correctChance * 0.1) { // Reduce frequency
      const isCorrect = Math.random() < correctChance;
      
      if (isCorrect) {
        const correctGuesses = [
          gameState.currentPrompt,
          gameState.currentPrompt.toLowerCase(),
          gameState.currentPrompt.split(' ')[0] // First word
        ];
        const guess = correctGuesses[Math.floor(Math.random() * correctGuesses.length)];
        
        addMessage(guess, 'guess', randomBot.id, true);
        setCorrectGuessers(prev => new Set(prev).add(randomBot.id));
        
        // Award points
        setPlayers(prev => prev.map(p => 
          p.id === randomBot.id ? { ...p, score: p.score + 100 } : p
        ));
        
        setConfettiTrigger(true);
      } else {
        // Random wrong guesses
        const wrongGuesses = [
          'hmm...', 'maybe a tree?', 'is it a house?', 'looks like a car',
          'dog?', 'person?', 'building?', 'animal?', 'not sure...'
        ];
        const guess = wrongGuesses[Math.floor(Math.random() * wrongGuesses.length)];
        addMessage(guess, 'guess', randomBot.id, false);
      }
    }
  }, [gameState, players, currentPlayerId, correctGuessers, addMessage]);

  const sendMessage = useCallback((content: string, type: 'guess' | 'chat') => {
    if (type === 'guess' && gameState.phase === 'drawing' && gameState.currentArtist !== currentPlayerId) {
      const isCorrect = checkGuess(content);
      addMessage(content, 'guess', currentPlayerId, isCorrect);
      
      if (isCorrect && !correctGuessers.has(currentPlayerId)) {
        setCorrectGuessers(prev => new Set(prev).add(currentPlayerId));
        setPlayers(prev => prev.map(p => 
          p.id === currentPlayerId ? { ...p, score: p.score + 100 } : p
        ));
        setConfettiTrigger(true);
      }
    } else {
      addMessage(content, 'chat');
    }
  }, [gameState, currentPlayerId, checkGuess, addMessage, correctGuessers]);

  const nextRound = useCallback(() => {
    if (gameState.currentRound >= gameState.totalRounds) {
      setGameState(prev => ({ ...prev, phase: 'finished' }));
      addMessage('Game finished! Thanks for playing!', 'system');
      return;
    }

    const nextArtistIndex = (players.findIndex(p => p.id === gameState.currentArtist) + 1) % players.length;
    const nextArtist = players[nextArtistIndex];
    const nextPrompt = DRAWING_PROMPTS[Math.floor(Math.random() * DRAWING_PROMPTS.length)];

    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentArtist: nextArtist.id,
      currentPrompt: nextPrompt,
      timeLeft: 90,
      phase: 'drawing',
      roundStartTime: new Date()
    }));

    setCorrectGuessers(new Set());
    addMessage(`Round ${gameState.currentRound + 1} - ${nextArtist.name} is drawing!`, 'system');
  }, [gameState, players, addMessage]);

  const timeUp = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: 'results' }));
    addMessage(`Time's up! The answer was: ${gameState.currentPrompt}`, 'system');
    
    setTimeout(() => {
      nextRound();
    }, 3000);
  }, [gameState.currentPrompt, addMessage, nextRound]);

  // Simulate bot behavior
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.phase === 'drawing') {
        simulateBotGuesses();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [simulateBotGuesses, gameState.phase]);

  return {
    currentPlayerId,
    players,
    messages,
    gameState,
    confettiTrigger,
    setConfettiTrigger,
    sendMessage,
    timeUp,
    nextRound
  };
};