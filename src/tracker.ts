import * as http from 'http';
import * as client from 'prom-client';
import { Counter } from './tracker.counter';
import { Gauge } from './tracker.gauge';
import { Histogram } from './tracker.historgram';

const NS_PER_SEC = 1000000000;

export class Tracker {

  private responseTime: Histogram;
  private requestCounter: Counter;

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
    this.responseTime = this.createHistogram(
      'response_time_histogram',
      'Response time histogram',
      ['name', 'uri', 'method', 'status'],
    );
    this.requestCounter = this.createCounter(
      'request_counter',
      'Counter of all requests',
      ['name', 'uri', 'method', 'status'],
    );

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

  public trackRequest(uri: string, method: string, status: number, seconds: number) {
    this.responseTime.labels(this.name, uri, method, status.toString()).observe(seconds);
    this.requestCounter.labels(this.name, uri, method, status.toString()).inc();
  }

  /**
   * creates a new counter metric
   * @param name name of the counter (used as metric key)
   * @param description helpful description for the metric
   * @param labels define a list of labels for this metric
   */
  public createCounter(name: string, description: string, labels: string[]): Counter {
    return new Counter(
      name,
      description,
      labels,
    );
  }

  /**
   * creates a new gauge metric
   * @param name name of the gauge (used as metric key)
   * @param description helpful description for the metric
   * @param labels define a list of labels for this metric
   */
  public createGauge(name: string, description: string, labels: string[]): Gauge {
    return new Gauge(
      name,
      description,
      labels,
    );
  }

  /**
   * creates a new histogram metric
   * @param name name of the histogram (used as metric key)
   * @param description helpful description for the metric
   * @param labels define a list of labels for this metric
   */
  public createHistogram(name: string, description: string, labels: string[]): Histogram {
    return new Histogram(
      name,
      description,
      labels,
    );
  }

  public getMetrics(): any {
    return client.register.metrics();
  }
}
