
import React from 'react';

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed = 160 }) => {
  const angle = Math.min(Math.max((speed / maxSpeed) * 270 - 135, -135), 135);

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i <= maxSpeed; i += 10) {
      const tickAngle = (i / maxSpeed) * 270 - 135;
      const isMajorTick = i % 20 === 0;
      const x1 = 100 + 80 * Math.cos((tickAngle - 90) * (Math.PI / 180));
      const y1 = 100 + 80 * Math.sin((tickAngle - 90) * (Math.PI / 180));
      const x2 = 100 + (isMajorTick ? 70 : 75) * Math.cos((tickAngle - 90) * (Math.PI / 180));
      const y2 = 100 + (isMajorTick ? 70 : 75) * Math.sin((tickAngle - 90) * (Math.PI / 180));

      ticks.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="stroke-gray-400 dark:stroke-gray-600"
          strokeWidth={isMajorTick ? 2 : 1}
        />
      );

      if (isMajorTick) {
        const textX = 100 + 60 * Math.cos((tickAngle - 90) * (Math.PI / 180));
        const textY = 100 + 60 * Math.sin((tickAngle - 90) * (Math.PI / 180));
        ticks.push(
          <text
            key={`label-${i}`}
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-light-text dark:fill-dark-text font-semibold"
          >
            {i}
          </text>
        );
      }
    }
    return ticks;
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Dial background */}
        <circle cx="100" cy="100" r="95" className="fill-light-bg dark:fill-dark-bg" />
        <circle cx="100" cy="100" r="90" className="stroke-gray-300 dark:stroke-gray-700 stroke-4 fill-light-card dark:fill-dark-card" />
        
        {/* Ticks and labels */}
        {renderTicks()}

        {/* Needle */}
        <g transform={`rotate(${angle} 100 100)`}>
          <polygon points="100,15 102,100 98,100" className="fill-light-red dark:fill-dark-red" />
          <circle cx="100" cy="100" r="5" className="fill-light-text dark:fill-dark-text" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black text-light-text dark:text-dark-text tracking-tighter">
          {Math.round(speed)}
        </span>
        <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">km/h</span>
      </div>
    </div>
  );
};

export default Speedometer;
