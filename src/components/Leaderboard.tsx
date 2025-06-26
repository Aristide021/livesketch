import React from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
  isOnline: boolean;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayerId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm bg-opacity-90">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
        Leaderboard
      </h3>
      
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
              player.id === currentPlayerId
                ? 'bg-blue-100 border-2 border-blue-300 shadow-md'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              {getRankIcon(index)}
              <span className="font-bold text-gray-700">#{index + 1}</span>
            </div>
            
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${player.avatar} flex items-center justify-center text-white font-bold text-sm`}>
                  {player.name[0]}
                </div>
                {player.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${player.id === currentPlayerId ? 'text-blue-700' : 'text-gray-700'}`}>
                  {player.name} {player.id === currentPlayerId && '(You)'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg text-gray-800">{player.score}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};