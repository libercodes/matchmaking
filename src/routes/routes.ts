import { Application } from 'express';
import { respondNotFound } from '../helpers/response.helper';
import { input } from '../middleware/logger.middleware';
import { getUsersLeaderboard } from '../modules/matchmaking/matchmaking.controller';

export default (app: Application) => {
  app.use(input);
  // API routes from modules
  app.get('/users', getUsersLeaderboard);

  app.use(respondNotFound);
};
