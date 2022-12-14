import { useEffect } from 'react';
import { Accelerometer, Gyro, IMUData, Thermometer, Status } from '../types';
import { processValue, _round } from './utils';

export interface ImuProps {
  name: string;
  status: Status;
  thermometer?: Thermometer;
  accelerometer?: Accelerometer;
  gyro?: Gyro;
  isCalibrated?: boolean;
  onCalibrate?: () => void;
}

export function Imu({
  name,
  status,
  thermometer,
  accelerometer,
  gyro,
  isCalibrated,
  onCalibrate,
  ...args
}: ImuProps) {
  const isDisconnected =
    status === 'Unavailable' || status === 'Not Started' || status === 'Error';

  return (
    <>
      <div
        className='inline-block p-8 rounded-2xl card text-neutral-600'
        {...args}
      >
        <div className='flex items-start justify-between '>
          <h1 className='mb-4 text-2xl text-neutral-300'>{name}</h1>
          <div className='flex'>
            {isDisconnected ? (
              <div className='!h-auto rounded-lg light-indicator'>
                <span className='red'></span>
                <span>Disconnected ({status}) </span>
              </div>
            ) : (
              <div className='!h-auto rounded-lg light-indicator'>
                <span className='green'></span>
                <span>Connected ({status})</span>
              </div>
            )}

            <div className='ml-2 temperature-indicator'>
              {processValue(thermometer?.celsius)} C
            </div>
          </div>
        </div>

        <div className='flex'>
          <div>
            <h2 className='section-title'>Accelerometer</h2>

            <div className='multi-value'>
              <div>
                <span>{processValue(accelerometer?.x)}</span>
                <span>x</span>
              </div>
              <div>
                <span>{processValue(accelerometer?.y)}</span>
                <span>y</span>
              </div>
              <div>
                <span>{processValue(accelerometer?.z)}</span>
                <span>z</span>
              </div>
            </div>

            <div className='simple-value'>
              <span>Acceleration</span>
              <span>{processValue(accelerometer?.acceleration)}</span>
            </div>

            <div className='simple-value'>
              <span>Inclinitation</span>
              <span>{processValue(accelerometer?.inclination)}</span>
            </div>

            <div className='simple-value'>
              <span>Orientation</span>
              <span>{processValue(accelerometer?.orientation)}</span>
            </div>

            <div className='simple-value'>
              <span>Pitch</span>
              <span>{processValue(accelerometer?.pitch)}</span>
            </div>

            <div className='simple-value'>
              <span>Roll</span>
              <span>{processValue(accelerometer?.roll)}</span>
            </div>
          </div>

          <div className='ml-2'>
            <h2 className='section-title'>Gyro</h2>

            <div className='multi-value'>
              <div>
                <span>{gyro?.x}</span>
                <span>x</span>
              </div>
              <div>
                <span>{gyro?.y}</span>
                <span>y</span>
              </div>
              <div>
                <span>{gyro?.z}</span>
                <span>z</span>
              </div>
            </div>

            <div className='mt-2 multi-value'>
              <label>Rate</label>
              <div>
                <span>{processValue(gyro?.rate?.x)}</span>
                <span>x</span>
              </div>
              <div>
                <span>{processValue(gyro?.rate?.y)}</span>
                <span>y</span>
              </div>
              <div>
                <span>{processValue(gyro?.rate?.z)}</span>
                <span>y</span>
              </div>
            </div>

            <div className='mt-2 multi-value'>
              <label className='text-[0.5rem]'>Pitch</label>
              <div>
                <span>{processValue(gyro?.pitch?.rate)}</span>
                <span>Rate</span>
              </div>
              <div>
                <span>{processValue(gyro?.pitch?.angle)}</span>
                <span>Angle</span>
              </div>
            </div>

            <div className='mt-2 multi-value'>
              <label>Roll</label>
              <div>
                <span>{processValue(gyro?.roll?.rate)}</span>
                <span>Rate</span>
              </div>
              <div>
                <span>{processValue(gyro?.roll?.angle)}</span>
                <span>Angle</span>
              </div>
            </div>

            <div className='mt-2 multi-value'>
              <label>Yaw</label>
              <div>
                <span>{processValue(gyro?.yaw?.rate)}</span>
                <span>Rate</span>
              </div>
              <div>
                <span>{processValue(gyro?.yaw?.angle)}</span>
                <span>Angle</span>
              </div>
            </div>

            {!isDisconnected && isCalibrated ? (
              <div className='mt-2 light-indicator'>
                <span className='blue'></span>
                <span>Calibrated</span>
                <button
                  onClick={() => (onCalibrate ? onCalibrate() : -1)}
                  className='px-4 py-1 ml-4 text-xs font-bold text-white uppercase bg-indigo-600 rounded-full'
                >
                  Calibrate
                </button>
              </div>
            ) : (
              <div className='mt-2 light-indicator'>
                <span className='off'></span>
                <span>Calibrated</span>
              </div>
            )}
          </div>

          {/* <div className='relative w-48 h-48 p-4 text-xs border border-neutral-400 font-regular'>
            <div className='relative w-24 h-24 p-4 overflow-visible text-xs border top-12 left-12 border-neutral-500 font-regular'>
              <div
                id='dot'
                className={`absolute w-2 h-2 rounded-full bg-neutral-500`}
              ></div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
