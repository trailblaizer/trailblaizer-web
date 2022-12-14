import { Knob, KnobData } from './knob';

export interface KnobsProps {
  knobs: Record<string, KnobData>;
}
export function Knobs({ knobs }: KnobsProps) {
  return (
    <div className='inline-grid items-center grid-cols-4 gap-8 p-16 mt-8 mr-8 rounded-2xl card text-neutral-600'>
      {knobs &&
        Object.keys(knobs)
          .sort((a, b) => {
            const knobA = knobs[a];
            const knobB = knobs[b];

            const indexA = +knobA.id.split('-')[1];
            const indexB = +knobB.id.split('-')[1];

            return indexA < indexB ? -1 : +1;
          })
          .map((key: string) => (
            <Knob key={key} min={0} max={127} value={knobs[key].counter} />
          ))}
    </div>
  );
}
