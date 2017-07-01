import * as http from 'http';
import * as client from 'prom-client';

const NS_PER_SEC = 1000000000;

export class Tracker {

  private responseTime = new client.Histogram({
    name: 'response_time_histogram',
    help: 'Response time histogram',
    labelNames: ['name', 'uri', 'method', 'status'],
  });

  private requestCounter = new client.Counter({
    name: 'request_counter',
    help: 'Counter of all requests',
    labelNames: ['name', 'uri', 'method', 'status'],
  });

  public static toFloat(timeTuple: [number, number]) {
    return timeTuple[0] + timeTuple[1] / NS_PER_SEC;
  }

  /**
   * Utility function that sums up time tuples (e.g. from `proces.hrtime()`)
   * @param {Array<[number, number]>} timeTuples array of time tuples [seconds, nanoseconds] that will be summed up
   * @return {number} summed up time in seconds (floating number)
   */
  public static sumUp(timeTuples: Array<[number, number]>) {
    const total: [number, number] = [0, 0];
    for (const timeTuple of timeTuples) {
      total[0] += timeTuple[0];
      total[1] += timeTuple[1];
    }
    return Tracker.toFloat(total);
  }

  public static getInstance(name: string, port: number = 9090, collectDefaultMetrics: boolean = true) {
    return new Tracker(name, port, collectDefaultMetrics);
  }

  private constructor(private name: string, port: number, collectDefaultMetrics: boolean) {
    if (collectDefaultMetrics) {
      // Probe every 5th second.
      client.collectDefaultMetrics(5000);
    }

    http.createServer((request, response) => {
      response.setHeader('Connection', 'close');
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.end(this.getMetrics());
    }).listen(port);
  }

  public trackResponseTime(uri: string, method: string, status: number, seconds: number) {
    this.responseTime.labels(this.name, uri, method, status.toString()).observe(seconds);
    this.requestCounter.labels(this.name, uri, method, status.toString()).inc();
  }

  public getMetrics(): any {
    return client.register.metrics();
  }
}
