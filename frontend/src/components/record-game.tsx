import type { JSX } from "react";

interface RecordGameProps {
  name: string;
  record: number;
  rank: number;
}

export function RecordGame({
  name,
  record,
  rank,
}: RecordGameProps): JSX.Element {
  return (
    <div className="h-full bg-lol-blue border-3 border-lol-blue-light p-4 rounded-md flex flex-col items-center">
      <h2 className="text-lg md:text-xl xl:text-3xl text-lol-gold font-bold text-center">
        {name}
      </h2>
      <div className="flex justify-between items-center my-3 text-base grow w-full md:text-lg xl:text-2xl">
        <p>Best Score: {record}</p>
        <span>Current Rank: #{rank}</span>
      </div>
    </div>
  );
}
