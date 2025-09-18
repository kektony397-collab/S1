
import { useState, useMemo } from 'react';

interface KalmanFilterOptions {
  r: number; // Process noise
  q: number; // Measurement noise
  a?: number; // State vector
  b?: number; // Control vector
  c?: number; // Measurement vector
}

class KalmanFilter {
  private r: number;
  private q: number;
  private a: number;
  private b: number;
  private c: number;
  private cov: number;
  private x: number;

  constructor({ r, q, a = 1, b = 0, c = 1 }: KalmanFilterOptions) {
    this.r = r;
    this.q = q;
    this.a = a;
    this.b = b;
    this.c = c;
    this.cov = NaN;
    this.x = NaN;
  }

  filter(z: number, u: number = 0): number {
    if (isNaN(this.x)) {
      this.x = (1 / this.c) * z;
      this.cov = (1 / this.c) * this.q * (1 / this.c);
    } else {
      // Prediction
      const predX = this.a * this.x + this.b * u;
      const predCov = this.a * this.cov * this.a + this.r;

      // Correction
      const k = predCov * this.c * (1 / (this.c * predCov * this.c + this.q));
      this.x = predX + k * (z - this.c * predX);
      this.cov = predCov - k * this.c * predCov;
    }
    return this.x;
  }
}

export const useKalmanFilter = (options: KalmanFilterOptions): ((value: number) => number) => {
  const filter = useMemo(() => new KalmanFilter(options), [options.r, options.q]);
  return (value: number) => filter.filter(value);
};
