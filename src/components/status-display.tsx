import { Status } from './types';

export interface StatusDisplayProps {
  title: string;
  status: Status;
}

export function StatusDisplay({ title, status }: StatusDisplayProps) {
  return (
    <div className='simple-value'>
      <span>{title}</span>
      <span className='!w-32 uppercase'>{status}</span>
    </div>
  );
}
