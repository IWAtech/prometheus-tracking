import * as client from 'prom-client';

export interface ICounter {
  /**
   * Increment with value
   * @param value The value to increment with
   * @param timestamp Timestamp to associate the time series with
   */
  inc(value?: number, timestamp?: number|Date): void;
}

export class Counter {
  private counter: client.Counter;
  constructor(name: string, description: string, labels: string[]) {
    this.counter = new client.Counter({
      name,
      help: description,
      labelNames: labels,
    });
  }

  /**
   * Increment with value
   * @param value The value to increment with
   * @param timestamp Timestamp to associate the time series with
   */
  public inc(value?: number, timestamp?: number|Date): void {
    this.counter.inc(value, timestamp);
  }

  /**
   * Return the child for given labels
   * @param values Label values
   * @return Configured counter with given labels
   */
  public labels(...values: string[]): ICounter {
    return this.counter.labels(...values);
  }
}
