import React, { useMemo, useState } from 'react';
import { useData, useFilters, computeFilteredSummary } from './hooks/useData';
import FilterBar from './components/FilterBar';
import KpiCards from './components/KpiCards';
import DataTable from './components/DataTable';
import {
  ScoreDistributionChart,
  EvaluatorPerformanceChart,
  QuartileChart,
  TipoEvaluacionChart,
  CriteriaComplianceChart,
  SupervisorPerformanceChart,
} from './components/Charts';
import SplashScreen from './components/SplashScreen';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { data, criteria, loading, error, lastUpdated, refresh } = useData();
  const { filters, filteredData, uniqueValues, setFilter, clearFilters, hasActiveFilters } = useFilters(data);

  // Recompute summary from filtered data
  const filteredSummary = useMemo(() => {
    return computeFilteredSummary(filteredData);
  }, [filteredData]);

  if (loading && !showSplash) {
    return (
      <>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <div className="dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando datos de calidad...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={refresh}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="dashboard" style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s', height: showSplash ? '100vh' : 'auto', overflow: showSplash ? 'hidden' : 'auto' }}>
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-logo-neon">
              TECHLINE
              <span>CONTACT CENTER</span>
            </div>
            <div>
              <h1 className="header-title">Calidad Dashboard</h1>
              <p className="header-subtitle">Sistema de Evaluación · TIGO</p>
            </div>
          </div>
          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="refresh-indicator">
                <div className="refresh-dot"></div>
                En vivo
              </div>
              <button 
                onClick={refresh}
                className="neon-reload-btn"
                title="Actualizar datos desde Google Sheets"
              >
                <span className="spin-icon">↻</span> Recargar
              </button>
            </div>
            {lastUpdated && (
              <span className="last-update">
                Última actualización: {lastUpdated.toLocaleTimeString('es-HN')}
              </span>
            )}
          </div>
        </header>

      {/* Filters */}
      <FilterBar
        filters={filters}
        uniqueValues={uniqueValues}
        setFilter={setFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* KPI Cards */}
      <KpiCards summary={filteredSummary} />

      {/* Charts Row 1 */}
      <div className="section-title" style={{ marginTop: '8px' }}>
        <span>📈</span> Análisis Visual
      </div>
      <div className="charts-grid">
        <ScoreDistributionChart summary={filteredSummary} />
        <EvaluatorPerformanceChart summary={filteredSummary} />
        <QuartileChart summary={filteredSummary} />
        <TipoEvaluacionChart summary={filteredSummary} />
        <SupervisorPerformanceChart summary={filteredSummary} />
        <CriteriaComplianceChart summary={filteredSummary} criteria={criteria} />
      </div>

      {/* Data Table */}
      <div className="section-title">
        <span>📋</span> Registro de Evaluaciones
      </div>
      <DataTable data={filteredData} />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '16px',
      }}>
        Calidad Dashboard — Techline Contact Center © {new Date().getFullYear()} · Datos en tiempo real desde Google Sheets
      </footer>
    </div>
    </>
  );
}

export default App;
