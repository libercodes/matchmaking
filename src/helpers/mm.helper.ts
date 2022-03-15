import { v4 } from 'uuid';
import { User } from '../types/types';

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
