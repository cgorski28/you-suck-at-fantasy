declare module 'espn-fantasy-football-api/node' {
  interface ClientOptions {
    leagueId: number;
  }

  interface CookieOptions {
    espnS2: string;
    SWID: string;
  }

  interface GetBoxscoreParams {
    seasonId: number;
    matchupPeriodId: number;
    scoringPeriodId: number;
  }

  interface GetTeamsParams {
    seasonId: number;
    scoringPeriodId: number;
  }

  interface GetLeagueInfoParams {
    seasonId: number;
  }

  interface GetFreeAgentsParams {
    seasonId: number;
    scoringPeriodId: number;
  }

  interface GetDraftInfoParams {
    seasonId: number;
    scoringPeriodId?: number;
  }

  class Client {
    constructor(options: ClientOptions);
    setCookies(cookies: CookieOptions): void;
    getBoxscoreForWeek(params: GetBoxscoreParams): Promise<unknown[]>;
    getTeamsAtWeek(params: GetTeamsParams): Promise<unknown[]>;
    getLeagueInfo(params: GetLeagueInfoParams): Promise<unknown>;
    getFreeAgents(params: GetFreeAgentsParams): Promise<unknown[]>;
    getDraftInfo(params: GetDraftInfoParams): Promise<unknown[]>;
  }

  export { Client };
}
