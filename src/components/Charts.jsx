import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// Shared chart defaults
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' },
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
  },
};

// 1. Score Distribution
export function ScoreDistributionChart({ summary }) {
  const data = useMemo(() => ({
    labels: ['0–25', '26–50', '51–75', '76–100'],
    datasets: [{
      label: 'Evaluaciones',
      data: summary?.scoreDistribution || [0, 0, 0, 0],
      backgroundColor: [
        'rgba(244, 63, 94, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(16, 185, 129, 0.7)',
      ],
      borderColor: [
        'rgba(244, 63, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
    }],
  }), [summary]);

  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { display: false },
    },
  };

  return (
    <div className="chart-card animate-in animate-in-1">
      <div className="chart-card-title"><span>📊</span> Distribución de Notas</div>
      <div className="chart-wrapper" style={{ height: '280px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

// 2. Evaluator Performance
export function EvaluatorPerformanceChart({ summary }) {
  const chartData = useMemo(() => {
    const evaluators = Object.entries(summary?.byEvaluator || {});
    const sorted = evaluators.sort((a, b) => b[1].avgNota - a[1].avgNota);
    
    return {
      labels: sorted.map(([name]) => name.split(' ').slice(0, 2).join(' ')),
      datasets: [
        {
          label: 'Nota Promedio',
          data: sorted.map(([, v]) => Math.round(v.avgNota * 10) / 10),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Tasa Aprobación (%)',
          data: sorted.map(([, v]) => Math.round(v.passRate * 10) / 10),
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const options = {
    ...commonOptions,
    indexAxis: 'y',
    plugins: { ...commonOptions.plugins },
    scales: {
      ...commonOptions.scales,
      x: { ...commonOptions.scales.x, max: 100 },
    },
  };

  return (
    <div className="chart-card animate-in animate-in-2">
      <div className="chart-card-title"><span>👤</span> Rendimiento por Evaluador</div>
      <div className="chart-wrapper" style={{ height: '280px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

// 3. Quartile Donut
export function QuartileChart({ summary }) {
  const data = useMemo(() => ({
    labels: ['Q1 (Excelente)', 'Q4 (Mejorar)'],
    datasets: [{
      data: [summary?.q1Count || 0, summary?.q4Count || 0],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(244, 63, 94, 0.8)'],
      borderColor: ['rgba(16, 185, 129, 1)', 'rgba(244, 63, 94, 1)'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }), [summary]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'bottom',
      },
    },
  };

  const total = (summary?.q1Count || 0) + (summary?.q4Count || 0);
  const q1Pct = total > 0 ? ((summary?.q1Count / total) * 100).toFixed(0) : 0;

  return (
    <div className="chart-card animate-in animate-in-3">
      <div className="chart-card-title"><span>🎯</span> Distribución por Cuartil</div>
      <div className="chart-wrapper" style={{ height: '280px', position: 'relative' }}>
        <Doughnut data={data} options={options} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', color: '#f1f5f9',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{q1Pct}%</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Q1</div>
        </div>
      </div>
    </div>
  );
}

// 4. Tipo Evaluación (Venta vs No Venta)
export function TipoEvaluacionChart({ summary }) {
  const data = useMemo(() => {
    const tipos = summary?.byTipo || {};
    return {
      labels: Object.keys(tipos),
      datasets: [
        {
          label: 'Nota Promedio',
          data: Object.values(tipos).map(v => Math.round(v.avgNota * 10) / 10),
          backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(99, 102, 241, 0.7)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(99, 102, 241, 1)'],
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const options = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins, legend: { display: false } },
    scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, max: 100 } },
  };

  return (
    <div className="chart-card animate-in animate-in-4">
      <div className="chart-card-title"><span>📞</span> Nota Promedio por Tipo</div>
      <div className="chart-wrapper" style={{ height: '280px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

// 5. Criteria Compliance Radar (as horizontal bars)
export function CriteriaComplianceChart({ summary, criteria }) {
  const chartData = useMemo(() => {
    const compliance = summary?.criteriaCompliance || {};
    // Show critical criteria compliance
    const criticalCriteria = (criteria || []).filter(c => c.id && c.id.startsWith('C') && !c.id.startsWith('NC')).slice(0, 12);
    
    return {
      labels: criticalCriteria.map(c => c.name.length > 25 ? c.name.slice(0, 25) + '…' : c.name),
      datasets: [{
        label: 'Cumplimiento (%)',
        data: criticalCriteria.map(c => {
          const comp = compliance[c.id];
          return comp ? Math.round(comp.compliance * 10) / 10 : 0;
        }),
        backgroundColor: criticalCriteria.map(c => {
          const comp = compliance[c.id];
          const val = comp ? comp.compliance : 0;
          if (val >= 80) return 'rgba(16, 185, 129, 0.7)';
          if (val >= 50) return 'rgba(245, 158, 11, 0.7)';
          return 'rgba(244, 63, 94, 0.7)';
        }),
        borderColor: criticalCriteria.map(c => {
          const comp = compliance[c.id];
          const val = comp ? comp.compliance : 0;
          if (val >= 80) return 'rgba(16, 185, 129, 1)';
          if (val >= 50) return 'rgba(245, 158, 11, 1)';
          return 'rgba(244, 63, 94, 1)';
        }),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }],
    };
  }, [summary, criteria]);

  const options = {
    ...commonOptions,
    indexAxis: 'y',
    plugins: { ...commonOptions.plugins, legend: { display: false } },
    scales: {
      ...commonOptions.scales,
      x: { ...commonOptions.scales.x, max: 100 },
      y: {
        ...commonOptions.scales.y,
        ticks: { ...commonOptions.scales.y.ticks, font: { family: 'Inter', size: 10 } },
      },
    },
  };

  return (
    <div className="chart-card chart-card-full animate-in animate-in-5">
      <div className="chart-card-title"><span>🔍</span> Cumplimiento de Criterios Críticos</div>
      <div className="chart-wrapper" style={{ height: '350px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

// 6. Trend over time
export function TrendChart({ summary }) {
  const chartData = useMemo(() => {
    const byDate = summary?.byDate || {};
    const dates = Object.keys(byDate).filter(d => d !== 'Sin Fecha').sort();

    return {
      labels: dates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('es-HN', { day: '2-digit', month: 'short' });
      }),
      datasets: [
        {
          label: 'Nota Promedio',
          data: dates.map(d => Math.round(byDate[d].avgNota * 10) / 10),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#111827',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Evaluaciones',
          data: dates.map(d => byDate[d].total),
          borderColor: 'rgba(20, 184, 166, 1)',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(20, 184, 166, 1)',
          pointBorderColor: '#111827',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: 'y1',
        },
      ],
    };
  }, [summary]);

  const options = {
    ...commonOptions,
    interaction: { mode: 'index', intersect: false },
    scales: {
      ...commonOptions.scales,
      y: { ...commonOptions.scales.y, position: 'left', title: { display: true, text: 'Nota', color: '#64748b', font: { family: 'Inter', size: 11 } } },
      y1: {
        ...commonOptions.scales.y,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Cantidad', color: '#64748b', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="chart-card chart-card-full animate-in animate-in-6">
      <div className="chart-card-title"><span>📈</span> Tendencia en el Tiempo</div>
      <div className="chart-wrapper" style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

// Supervisor Performance Chart
export function SupervisorPerformanceChart({ summary }) {
  const chartData = useMemo(() => {
    const supervisors = Object.entries(summary?.bySupervisor || {});
    const sorted = supervisors.sort((a, b) => b[1].avgNota - a[1].avgNota);
    
    return {
      labels: sorted.map(([name]) => name.split(' ').slice(0, 2).join(' ')),
      datasets: [
        {
          label: 'Nota Promedio',
          data: sorted.map(([, v]) => Math.round(v.avgNota * 10) / 10),
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Evaluaciones',
          data: sorted.map(([, v]) => v.total),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [summary]);

  const options = {
    ...commonOptions,
    plugins: { ...commonOptions.plugins },
    scales: { ...commonOptions.scales },
  };

  return (
    <div className="chart-card animate-in animate-in-3">
      <div className="chart-card-title"><span>👥</span> Rendimiento por Supervisor</div>
      <div className="chart-wrapper" style={{ height: '280px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
