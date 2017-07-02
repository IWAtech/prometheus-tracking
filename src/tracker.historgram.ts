import * as client from 'prom-client';

export class Histogram {
  private histogram: client.Histogram;
  constructor(name: string, description: string, labels: string[]) {
    this.histogram = new client.Histogram({
      name,
      help: description,
      labelNames: labels,
    });
  }

  /**
   * Observe value
   * @param value The value to observe
   */
  public observe(value: number): void {
    this.histogram.observe(value);
  }

  /**
   * Return the child for given labels
   * @param values Label values
   * @return Configured counter with given labels
   */
  public labels(...values: string[]): Histogram {
    this.histogram.labels(...values);
    return this;
  }

  /**
   * Reset histogram values
   */
  public reset(): void {
    this.histogram.reset();
  }
}
