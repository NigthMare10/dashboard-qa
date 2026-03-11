import React, { useState, useEffect, useRef } from 'react';

function AnimatedNumber({ value, decimals = 0, suffix = '', duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const startVal = prevValue.current;
    const endVal = value;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = startVal + (endVal - startVal) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endVal;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return <>{display.toFixed(decimals)}{suffix}</>;
}

export default function KpiCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      icon: '📊',
      label: 'Total Evaluaciones',
      value: summary.total,
      decimals: 0,
      detail: `${summary.byTipo?.VENTA?.total || 0} ventas · ${summary.byTipo?.['NO VENTA']?.total || 0} no ventas`,
    },
    {
      icon: '⭐',
      label: 'Nota Promedio',
      value: summary.avgNota,
      decimals: 1,
      detail: `Rango: 0 – 100 puntos`,
    },
    {
      icon: '✅',
      label: 'Tasa de Aprobación',
      value: summary.passRate,
      decimals: 1,
      suffix: '%',
      detail: `${summary.passCount} de ${summary.total} pasan criterios críticos`,
    },
    {
      icon: '🏆',
      label: 'Cuartil Q1',
      value: summary.q1Count,
      decimals: 0,
      detail: `${summary.total > 0 ? ((summary.q1Count / summary.total) * 100).toFixed(1) : 0}% del total alcanza Q1`,
    },
    {
      icon: '⚠️',
      label: 'Cuartil Q4',
      value: summary.q4Count,
      decimals: 0,
      detail: `${summary.total > 0 ? ((summary.q4Count / summary.total) * 100).toFixed(1) : 0}% del total en Q4`,
    },
    {
      icon: '📈',
      label: 'Evaluadores Activos',
      value: Object.keys(summary.byEvaluator || {}).length,
      decimals: 0,
      detail: `${Object.keys(summary.bySupervisor || {}).length} supervisores activos`,
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div key={i} className={`kpi-card animate-in animate-in-${i + 1}`}>
          <div className="kpi-card-icon">{card.icon}</div>
          <div className="kpi-card-label">{card.label}</div>
          <div className="kpi-card-value">
            <AnimatedNumber
              value={card.value}
              decimals={card.decimals}
              suffix={card.suffix || ''}
            />
          </div>
          <div className="kpi-card-detail">{card.detail}</div>
        </div>
      ))}
    </div>
  );
}
