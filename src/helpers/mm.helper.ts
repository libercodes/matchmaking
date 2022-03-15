import { v4 } from 'uuid';
import { Match, User } from '../types/types';

export const createUser = (): User => {
  const user: User = {
    id: v4(),
    mmr: {
      timePlayed: 0,
      wins: 0,
      winSpree: 0,
      score: 0,
    },
  };

  return user;
};

export const createMatch = (user: User, foundOpponent: User): Match => {
  const match: Match = {
    id: v4(),
    player1: user,
    player2: foundOpponent,
    winner: null,
    scoreDiff: Math.abs(user.mmr.score - foundOpponent.mmr.score),
  };

  return match;
};

export const asyncTimeout = async (ms: number) => new Promise((done) => setTimeout(done, ms));
