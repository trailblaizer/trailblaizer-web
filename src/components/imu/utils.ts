import { Status, StatusCallback, StatusFetcher } from '../types';

export const _round = (v: number, exp: number = 0) =>
  Math.round(v * Math.pow(10, exp)) / Math.pow(10, exp);

export const processValue = (value?: number) =>
  !value ? '#' : _round(value, 2);
