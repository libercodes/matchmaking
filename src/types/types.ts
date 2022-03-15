import { Socket } from 'socket.io';

export interface Match {
  id: string;
  player1: User;
  player2: User;
  winner: string | null;
  scoreDiff: number
  started_at?: Date
}

export interface User {
  id: string;
  mmr: MMR
}

export interface MMR {
  timePlayed: number;
  wins: number;
  winSpree: number;
  score: number
}

export interface Client extends Socket {
  user: User;
  matchId: string | null;
}

export enum Events {
  join_queue = 'join_queue',
  leave_queue = 'leave_queue',
  match_started = 'match_started',
  match_ended = 'match_ended',
  make_move = 'make_move',
}
