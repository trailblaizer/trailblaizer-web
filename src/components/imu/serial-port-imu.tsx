import { Status } from '../types';
import { processValue } from './utils';

export interface SerialPortImuProps {
  name: string;
  status: Status;
  data: {
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
  };
}

export function SerialPortImu({
  name,
  status,
  data,
  ...args
}: SerialPortImuProps) {
  const isDisconnected =
    status === 'Unavailable' || status === 'Not Started' || status === 'Error';

  return (
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
        </div>
      </div>

      <div className='flex'>
        <div>
          <h2 className='section-title'>Accelerometer</h2>

          <div className='multi-value'>
            <div>
              <span>{processValue(data.ax)}</span>
              <span>ax</span>
            </div>
            <div>
              <span>{processValue(data.ay)}</span>
              <span>ay</span>
            </div>
            <div>
              <span>{processValue(data.az)}</span>
              <span>az</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className='section-title'>Gyro</h2>

          <div className='multi-value'>
            <div>
              <span>{processValue(data.gx)}</span>
              <span>gx</span>
            </div>
            <div>
              <span>{processValue(data.gy)}</span>
              <span>gy</span>
            </div>
            <div>
              <span>{processValue(data.gz)}</span>
              <span>gz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
