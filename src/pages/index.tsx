import Head from 'next/head';
import { useState } from 'react';
import { Imu } from '../components/imu/imu';
import { Knob, KnobData } from '../components/knobs/knob';
import { useInterval } from '../components/use-interval';
import * as THREE from 'three';
import { IMUData, SerialPortIMUData, Status } from '../components/types';
import {
  addStatusFetcher,
  createStatusFetcher,
  fetchAllStatuses,
} from '../components/imu/status-fetcher';
import { StatusDisplay } from '../components/status-display';
import { Knobs } from '../components/knobs/knobs';
import { SerialPortImu } from '../components/imu/serial-port-imu';

function isSerialPortIMU(
  imu: IMUData | SerialPortIMUData
): imu is SerialPortIMUData {
  const { ax, ay, az, gx, gy, gz } = imu as SerialPortIMUData;

  return !!ax && !!ay && !!az && !!gx && !!gy && !!gz;
}

export default function Home() {
  const [lhImu, setLHImu] = useState<IMUData | SerialPortIMUData>({
    accelerometer: undefined,
    gyro: undefined,
    thermometer: undefined,
  });
  const [rhImu, setRHImu] = useState<IMUData | SerialPortIMUData>({
    accelerometer: undefined,
    gyro: undefined,
    thermometer: undefined,
  });
  const [knobs, setKnobs] = useState<Record<string, KnobData>>({});
  // const [faders, setFaders] = useState<Record<string, FaderData>>({});

  const [lhStatus, setLhStatus] = useState<Status>('Unavailable');
  const [rhStatus, setRhStatus] = useState<Status>('Unavailable');
  const [kAndFStatus, setKAndFStatus] = useState<Status>('Unavailable');
  const [maStatus, setMaStatus] = useState<Status>('Unavailable');
  const [mrStatus, setMrStatus] = useState<Status>('Unavailable');

  addStatusFetcher('lhStatus', 'http://localhost:10000/status', setLhStatus);
  addStatusFetcher('rhStatus', 'http://localhost:10001/status', setRhStatus);
  addStatusFetcher(
    'kAndFStatus',
    'http://localhost:10002/status',
    setKAndFStatus
  );
  addStatusFetcher('maStatus', 'http://localhost:12000/status', setMaStatus);
  addStatusFetcher(
    'mrStatus',
    'http://localhost:14000/transport/status',
    setMrStatus
  );

  useInterval(async () => {
    fetchAllStatuses();

    await fetch('http://localhost:12000/data')
      .then(
        (res) =>
          res.json() as Promise<{
            imus: {
              leftHand: IMUData | SerialPortIMUData;
              rightHand: IMUData | SerialPortIMUData;
            };
            knobs: Record<string, KnobData>;
          }>
      )
      .then((data) => {
        if (data?.imus?.leftHand) {
          setLHImu(data.imus.leftHand);
        }

        if (data?.imus?.rightHand) {
          setRHImu(data.imus.rightHand);
        }

        if (data?.knobs) {
          setKnobs(data.knobs);
        }
      })
      .catch(() => {});
  }, 500);

  return (
    <div>
      <Head>
        <title>MIDI Aggregator</title>
        <meta name='description' content='MIDI Aggregator' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='branding'>
        <h1>Trailblaizer</h1>
        <h1>Configurator</h1>
      </div>

      <div className='p-24'>
        <div className='flex mx-auto mt-24'>
          <div className='mr-8'>
            {isSerialPortIMU(lhImu) ? (
              <SerialPortImu
                name='IMU (Left Hand)'
                status={lhStatus}
                data={lhImu}
              />
            ) : (
              <Imu
                name='IMU (Left Hand)'
                status={lhStatus}
                accelerometer={lhImu.accelerometer}
                gyro={lhImu.gyro}
                thermometer={lhImu.thermometer}
                isCalibrated={lhImu.isCalibrated}
              />
            )}
          </div>
          <div className='mr-8'>
            {isSerialPortIMU(rhImu) ? (
              <></>
            ) : (
              <Imu
                name='IMU (Right Hand)'
                status={rhStatus}
                accelerometer={rhImu.accelerometer}
                gyro={rhImu.gyro}
                thermometer={rhImu.thermometer}
                isCalibrated={rhImu.isCalibrated}
              />
            )}
          </div>
        </div>

        <div className='flex'>
          <Knobs knobs={knobs} />

          <div className='inline-flex flex-col p-8 mt-8 card rounded-2xl'>
            <StatusDisplay
              title='Middleware #1 (IMU Left Hand)'
              status={lhStatus}
            />
            <StatusDisplay
              title='Middleware #2 (IMU Right Hand)'
              status={rhStatus}
            />
            <StatusDisplay
              title='Middleware #3 (Knobs & Faders)'
              status={kAndFStatus}
            />
            <StatusDisplay title='Middleware Aggregator' status={maStatus} />

            <StatusDisplay title='MIDI Router' status={mrStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
