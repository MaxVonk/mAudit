'use client';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const getStatus = (s: number) => {
    // Canonical score bands per auditor spec & SKILL.md (90 / 70)
    if (s >= 90) {
      return {
        color: 'text-emerald-400',
        stroke: '#10B981',
        badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        label: 'Utmärkt säkerhetsläge',
      };
    }
    if (s >= 70) {
      return {
        color: 'text-amber-400',
        stroke: '#F59E0B',
        badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        label: 'Godtagbart med åtgärdsbehov',
      };
    }
    return {
      color: 'text-rose-400',
      stroke: '#EF4444',
      badgeClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      label: 'Kritiska sårbarheter identifierade',
    };
  };

  const status = getStatus(score);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border border-border bg-surface/90 text-center shadow-lg">
      <div className="relative flex items-center justify-center mb-4" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={status.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-5xl font-extrabold tracking-tight text-white">{score}</span>
            <span className="text-xl text-text-muted font-medium ml-1">/100</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mt-1">
            Hälsopoäng
          </span>
        </div>
      </div>

      <div className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}>
        {status.label}
      </div>
    </div>
  );
}

