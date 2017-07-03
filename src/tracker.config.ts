export interface ITrackerConfig {
  name: string;
  port?: number;
  startServer?: boolean;
  collectDefaultMetrics?: boolean;
}

export class TrackerConfig {
  constructor(
    public name: string,
    public port: number = 9090,
    public startServer: boolean = true,
    public collectDefaultMetrics: boolean = true,
  ) {}
}
