import React from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { GameTimer } from './components/GameTimer';
import { Leaderboard } from './components/Leaderboard';
import { ChatInterface } from './components/ChatInterface';
import { ConfettiEffect } from './components/ConfettiEffect';
import { GamePrompt } from './components/GamePrompt';
import { useGameState } from './hooks/useGameState';
import { Palette, Users, Trophy, Clock } from 'lucide-react';

function App() {
  const {
    currentPlayerId,
    players,
    messages,
    gameState,
    confettiTrigger,
    setConfettiTrigger,
    sendMessage,
    timeUp,
    nextRound
  } = useGameState();

  const isMyTurn = gameState.currentArtist === currentPlayerId;
  const currentArtist = players.find(p => p.id === gameState.currentArtist);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Palette className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">LiveSketch Battle</h1>
            <Palette className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg opacity-90">Real-time multiplayer drawing game</p>
        </header>

        {/* Game Status Bar */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              Round {gameState.currentRound}/{gameState.totalRounds}
            </span>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2">
            <Users className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {players.filter(p => p.isOnline).length} Players Online
            </span>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              Artist: {currentArtist?.name}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <GameTimer
                duration={90}
                onTimeUp={timeUp}
                isActive={gameState.phase === 'drawing'}
              />
              
              <Leaderboard
                players={players}
                currentPlayerId={currentPlayerId}
              />
            </div>

            {/* Main Canvas Area */}
            <div className="lg:col-span-2 space-y-6">
              <GamePrompt
                prompt={gameState.currentPrompt}
                isVisible={gameState.phase === 'results' || gameState.phase === 'finished'}
                isMyTurn={isMyTurn}
              />
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <DrawingCanvas
                  isMyTurn={isMyTurn}
                  disabled={gameState.phase !== 'drawing'}
                />
                
                {gameState.phase === 'results' && (
                  <div className="mt-4 text-center">
                    <div className="bg-white bg-opacity-90 rounded-lg p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Round {gameState.currentRound} Complete!
                      </h3>
                      <p className="text-gray-600">
                        The drawing was: <span className="font-bold">{gameState.currentPrompt}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Next round starting soon...
                      </p>
                    </div>
                  </div>
                )}
                
                {gameState.phase === 'finished' && (
                  <div className="mt-4 text-center">
                    <div className="bg-white bg-opacity-90 rounded-lg p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        🎉 Game Complete! 🎉
                      </h3>
                      <div className="space-y-2">
                        {players
                          .sort((a, b) => b.score - a.score)
                          .map((player, index) => (
                            <div
                              key={player.id}
                              className={`p-3 rounded-lg ${
                                index === 0
                                  ? 'bg-yellow-100 border-2 border-yellow-300'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <span className="font-bold">
                                #{index + 1} {player.name}: {player.score} points
                                {index === 0 && ' 👑'}
                              </span>
                            </div>
                          ))}
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                currentPlayerId={currentPlayerId}
                isGuessingPhase={gameState.phase === 'drawing' && !isMyTurn}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfettiEffect
        trigger={confettiTrigger}
        onComplete={() => setConfettiTrigger(false)}
      />

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;