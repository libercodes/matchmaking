/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-continue */
import { v4 } from 'uuid';
import { Match, User } from '../../types/types';

/* eslint-disable @typescript-eslint/no-empty-function */
export class GameStore {
  private static instance: GameStore = null;

  private topScore = 0;

  private queue: User[] = [];

  private matches: Match[] = [];

  public users: User[] = [];

  private constructor() { }

  public static getInstance() {
    if (!this.instance) GameStore.instance = new GameStore();
    return this.instance;
  }

  public getMatch(id: string): Match {
    return this.matches.find((x) => x.id === id);
  }

  public joinQueue(user: User): void {
    const found = this.queue.find((x) => x.id === user.id);
    if (found) return;
    this.queue.push(user);
    if (user.mmr.score > this.topScore) this.topScore = user.mmr.score;
  }

  public lookForAMatch(user: User): Match | null {
    const foundOpponent = this.findUserWithSimilarMMRScore(user);
    if (!foundOpponent) return;

    const match: Match = {
      id: v4(),
      player1: user,
      player2: foundOpponent,
      winner: null,
      scoreDiff: Math.abs(user.mmr.score - foundOpponent.mmr.score),
    };
    this.matches.push(match);

    setTimeout(() => {
      const betterMatchFound = this.checkIfBetterMatchExists(match);
      if (betterMatchFound) this.removeMatch(match);
      else {
        match.started_at = new Date();
        // Once the game starts we remove the players from the queue
        this.leaveQueue(match.player1);
        this.leaveQueue(match.player2);
      }
    }, 5000);
  }

  public leaveQueue(user: User): void {
    this.queue = this.queue.filter((x) => x.id !== user.id);
  }

  public endMatch(match: Match) {
    if (!match.winner) return;
    this.updateMMR(match, match.player1);
    this.updateMMR(match, match.player2);

    this.removeMatch(match);
  }

  private updateMMR(match: Match, player: User) {
    const now = new Date();
    player.mmr.timePlayed += (+now - +match.started_at) / 1000;
    if (match.winner === player.id) {
      player.mmr.wins++;
      player.mmr.winSpree++;
    } else player.mmr.winSpree = 0;

    player.mmr.score = this.calculateScore(player);
  }

  private findUserWithSimilarMMRScore(user: User): User | null {
    if (this.queue.length === 0) return null;
    for (let scoreDiff = 100; scoreDiff < this.topScore + 100; scoreDiff += 100) {
      const usersWithSimilarMMR = this.queue
        .filter((x) => x.id !== user.id && Math.abs(x.mmr.score - user.mmr.score) <= scoreDiff)
        .sort((a, b) => Math.abs(a.mmr.score - user.mmr.score) - Math.abs(b.mmr.score - user.mmr.score));

      if (usersWithSimilarMMR.length === 0) continue;
      const foundUser = usersWithSimilarMMR[0];
      return foundUser;
    }
    return null;
  }

  private checkIfBetterMatchExists(currentMatch: Match): boolean {
    const betterMatchForP2 = this.matches.filter(
      (x) => (x.player2.id === currentMatch.player2.id || x.player1.id === currentMatch.player2.id)
        && x.scoreDiff < currentMatch.scoreDiff,
    );

    const betterMatchForP1 = this.matches.filter(
      // p1 is the one that creates the match, so we don't need to check for that.
      // p2 is the one that is "found" as an opponent
      (x) => (x.player2.id === currentMatch.player1.id)
          && x.scoreDiff < currentMatch.scoreDiff,
    );

    return !!(betterMatchForP1 || betterMatchForP2);
  }

  private removeMatch(match: Match): void {
    this.matches = this.matches.filter((x) => x.id !== match.id);
  }

  private calculateScore(user: User): number {
    const { winSpree, wins, timePlayed } = user.mmr;

    let score = timePlayed;
    if (wins > 0) score += wins * 10;
    if (winSpree > 0) score += winSpree * 20;

    return score;
  }
}
