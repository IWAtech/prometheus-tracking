import * as client from 'prom-client';

export interface IGauge {
  /**
   * Increment with value
   * @param value The value to increment with
   * @param timestamp Timestamp to associate the time series with
   */
  inc(value?: number, timestamp?: number|Date): void;

  /**
   * Decrement with value
   * @param value The value to decrement with
   * @param timestamp Timestamp to associate the time series with
   */
  dec(value?: number, timestamp?: number|Date): void;

  /**
   * Set gauge value
   * @param value The value to set
   * @param timestamp Timestamp to associate the time series with
   */
  set(value?: number, timestamp?: number|Date): void;
}

export class Gauge {
  private gauge: client.Gauge;
  constructor(name: string, description: string, labels: string[]) {
    this.gauge = new client.Gauge({
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
    this.gauge.inc(value, timestamp);
  }

  /**
   * Decrement with value
   * @param value The value to decrement with
   * @param timestamp Timestamp to associate the time series with
   */
  public dec(value?: number, timestamp?: number|Date): void {
    this.gauge.dec(value, timestamp);
  }

  /**
   * Set gauge value
   * @param value The value to set
   * @param timestamp Timestamp to associate the time series with
   */
  public set(value?: number, timestamp?: number|Date): void {
    this.gauge.set(value, timestamp);
  }

  /**
   * Return the child for given labels
   * @param values Label values
   * @return Configured gauge with given labels
   */
  public labels(...values: string[]): IGauge {
    return this.gauge.labels(...values);
  }
}
