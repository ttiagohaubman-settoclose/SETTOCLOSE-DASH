import { useMemo } from "react";

type Props = {
  english: number;
  spanish: number;
};

export function LanguagePie({ english, spanish }: Props) {
  const total = english + spanish;
  const englishPct = total === 0 ? 0 : (english / total) * 100;
  const spanishPct = total === 0 ? 0 : (spanish / total) * 100;

  const pieStyle = useMemo(
    () => ({
      background: `conic-gradient(#60a5fa 0% ${englishPct}%, #f59e0b ${englishPct}% 100%)`,
    }),
    [englishPct],
  );

  return (
    <section className="card lang-wrap">
      <h3>Language Split</h3>
      <div className="lang-row">
        <div className="pie" style={pieStyle} aria-label="Language split pie chart" />
        <div className="legend">
          <div title={`${englishPct.toFixed(1)}%`}><span className="dot en" /> English: {english}</div>
          <div title={`${spanishPct.toFixed(1)}%`}><span className="dot es" /> Spanish: {spanish}</div>
          <p className="muted">Hover each label to see exact %</p>
        </div>
      </div>
    </section>
  );
}
