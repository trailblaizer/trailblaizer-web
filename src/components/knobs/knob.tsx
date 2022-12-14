import { useEffect, useState } from 'react';
import { getPathDStringFunction, KnobOptionsFull } from '../circle-arc';

export interface KnobData {
  id: string;
  direction: 'cw' | 'ccw';
  counter: number;
  min: number;
  max: number;
}

export interface KnobProps {
  name?: string;
  min: number;
  max: number;
  value: number;
  radius?: number;
}

export function Knob({ name, min, max, value, radius, ...args }: KnobProps) {
  const [greenArcPathD, setGreenArcPathD] = useState('');
  const defaultOptions: KnobOptionsFull = {
    radius: radius || 25,
    rotation: 0,
    t1: 90,
  };

  const greenArcD = getPathDStringFunction({
    ...defaultOptions,
    radius: defaultOptions.radius * 0.8,
    cx: defaultOptions.radius,
    cy: defaultOptions.radius,
  });

  useEffect(() => {
    setGreenArcPathD(greenArcD(359 * ((value - min) / (max - min))));
  }, [value, min, max, greenArcD]);

  return (
    <div
      className='relative items-center justify-center inline-block text-center rounded-full cursor-pointer w-fit bg-[#0e0e0e] card'
      {...args}
    >
      <p>{name}</p>
      <svg
        width={defaultOptions.radius * 2}
        height={defaultOptions.radius * 2}
        className='p-0 bg-transparent'
      >
        <g>
          <path
            className='fill-transparent stroke-green-400'
            strokeWidth={defaultOptions.radius * 0.2}
            d={greenArcPathD}
          />
        </g>
      </svg>
      <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
        <span className='text-xs font-bold text-center text-neutral-500'>
          {value}
        </span>
      </div>
    </div>
  );
}
