/* eslint-disable no-param-reassign */
import { RequestHandler } from 'express';
import { io } from '../../config/socket';
import logger from '../../helpers/logger.helper';
import { createUser } from '../../helpers/mm.helper';
import { Client, Events } from '../../types/types';
import { GameStore } from './store';

export const getUsersLeaderboard: RequestHandler = (req, res, next) => {
  const store = GameStore.getInstance();
  return store.users.sort((a, b) => b.mmr.score - a.mmr.score);
};

const setEventsForClient = (client: Client) => {
  client.on(Events.join_queue, () => {
    const store = GameStore.getInstance();

    store.joinQueue(client.user);
    const match = store.lookForAMatch(client.user);
    if (!match) return;

    // Find the opponent's socket and join both to a room.
    io.sockets.sockets.forEach((opponent: Client) => {
      if (opponent.user.id === match.player2.id) {
        client.join(match.id);
        client.matchId = match.id;
        opponent.join(match.id);
        opponent.matchId = match.id;

        logger.info(`Match found p1[${match.player1}] - p2[${match.player2}] SCORE DIFF ${match.scoreDiff}`);
        io.to(match.id).emit(Events.match_started, match);
        return match;
      }
      return null;
    });
  });

  client.on(Events.leave_queue, () => {
    const store = GameStore.getInstance();
    store.leaveQueue(client.user);
  });

  client.on(Events.make_move, () => {
    const store = GameStore.getInstance();
    const match = store.getMatch(client.matchId);
    // GAME LOGIC TO HANDLE MOVE

    // if there is a winner
    // eslint-disable-next-line no-constant-condition
    if (true) {
      match.winner = match.player1.id; // just to test
      store.endMatch(match);
    }
  });
};

export const setIOEvents = () => {
  io.on('connection', (client: Client) => {
    client.user = createUser();
    setEventsForClient(client);
  });
};
