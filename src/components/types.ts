export interface Thermometer {
  celsius: number;
  fahrenheit: number;
  kelvin: number;
}

export interface Accelerometer {
  x: number;
  y: number;
  z: number;
  acceleration: number;
  inclination: number;
  orientation: number;
  pitch: number;
  roll: number;
}

export interface Gyro {
  x: number;
  y: number;
  z: number;
  isCalibrated: boolean;
  pitch: {
    rate: number;
    angle: number;
  };
  rate: {
    x: number;
    y: number;
    z: number;
  };
  roll: {
    rate: number;
    angle: number;
  };
  yaw: {
    rate: number;
    angle: number;
  };
}

export interface IMUData {
  thermometer?: Thermometer;
  accelerometer?: Accelerometer;
  gyro?: Gyro;
  isCalibrated?: boolean;
}

export interface SerialPortIMUData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

export type Status =
  | 'Unavailable'
  | 'Not Started'
  | 'Waiting'
  | 'Starting'
  | 'Broadcasting'
  | 'Error';

export type StatusCallback = (status: Status) => void;
export type StatusFetcher = {
  fetch(): StatusFetcher;
  register: (callback: StatusCallback) => StatusFetcher;
};
