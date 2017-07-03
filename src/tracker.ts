import * as http from 'http';
import * as client from 'prom-client';
import { TrackerConfig } from './tracker.config';
import { Counter } from './tracker.counter';
import { Gauge } from './tracker.gauge';
import { Histogram } from './tracker.historgram';

const NS_PER_SEC = 1000000000;

export class Tracker {

  private responseTime: Histogram;

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

  public static getInstance(config: TrackerConfig) {
    return new Tracker(new TrackerConfig(
      config.name,
      config.port,
      config.startServer,
      config.collectDefaultMetrics,
    ));
  }

  private constructor(private config: TrackerConfig) {
    this.responseTime = this.createHistogram(
      'http_response_time_seconds',
      'Response time histogram',
      ['name', 'url', 'method', 'code'],
    );

    if (config.collectDefaultMetrics) {
      // Probe every 5th second.
      client.collectDefaultMetrics(5000);
    }

    if (config.startServer) {
      http.createServer((request, response) => {
        response.setHeader('Connection', 'close');
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end(this.getMetrics());
      }).listen(config.port);
    }
  }

  /**
   * track a single request: tracks response time and request count including labels with request properties
   * @param url URL that should be tracked (format like "/blog/2017")
   * @param method request method (eg GET, POST, ...)
   * @param code response HTTP status code (eg. 200)
   * @param seconds response time of this particular request
   */
  public trackRequest(url: string, method: string, code: number, seconds: number) {
    this.responseTime.labels(this.config.name, url, method, code.toString()).observe(seconds);
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

  public getMetrics(): string {
    return client.register.metrics();
  }
}
