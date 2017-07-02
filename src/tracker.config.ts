export class TrackerConfig {
  constructor(
    public name: string,
    public port: number = 9090,
    public startServer: boolean = true,
    public collectDefaultMetrics: boolean = true,
  ) {}
}
