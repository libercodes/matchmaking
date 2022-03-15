/* eslint-disable no-constant-condition */
/* eslint-disable no-param-reassign */
import { RequestHandler } from 'express';
import { io } from '../../config/socket';
import logger from '../../helpers/logger.helper';
import { createUser } from '../../helpers/mm.helper';
import { Client, Events } from '../../types/types';
import { GameService } from './store';

export const getUsersLeaderboard: RequestHandler = (req, res, next) => {
  const store = GameService.getInstance();
  return store.users.sort((a, b) => b.mmr.score - a.mmr.score);
};

const setEventsForClient = (client: Client) => {
  client.on(Events.join_queue, async () => {
    const store = GameService.getInstance();

    store.joinQueue(client.user);
    const match = await store.lookForAMatch(client.user);
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
      }
    });
  });

  client.on(Events.leave_queue, () => {
    const store = GameService.getInstance();
    store.leaveQueue(client.user);
  });

  client.on(Events.make_move, () => {
    const store = GameService.getInstance();
    const match = store.getMatch(client.matchId);

    // GAME LOGIC TO HANDLE MOVE

    if (true) { // if there is a winner
      match.winner = match.player1.id; // just to test
      store.endMatch(match);
    }
  });

  client.on('disconnect', () => {
    const store = GameService.getInstance();
    store.disconnectUser(client.user);
  });
};

export const setIOEvents = () => {
  io.on('connection', (client: Client) => {
    client.user = createUser();
    setEventsForClient(client);
  });
};
