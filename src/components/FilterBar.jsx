import React from 'react';

export default function FilterBar({ filters, uniqueValues, setFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Evaluador QA</label>
        <select
          className="filter-select"
          value={filters.evaluador}
          onChange={e => setFilter('evaluador', e.target.value)}
        >
          <option value="">Todos</option>
          {uniqueValues.evaluadores.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Supervisor</label>
        <select
          className="filter-select"
          value={filters.supervisor}
          onChange={e => setFilter('supervisor', e.target.value)}
        >
          <option value="">Todos</option>
          {uniqueValues.supervisores.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Asesor</label>
        <select
          className="filter-select"
          value={filters.asesor}
          onChange={e => setFilter('asesor', e.target.value)}
        >
          <option value="">Todos</option>
          {uniqueValues.asesores.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Campaña / BU</label>
        <select
          className="filter-select"
          value={filters.campana}
          onChange={e => setFilter('campana', e.target.value)}
        >
          <option value="">Todas</option>
          {uniqueValues.campanas.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Tipo Evaluación</label>
        <select
          className="filter-select"
          value={filters.tipoEvaluacion}
          onChange={e => setFilter('tipoEvaluacion', e.target.value)}
        >
          <option value="">Todos</option>
          {uniqueValues.tipos.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Cuartil</label>
        <select
          className="filter-select"
          value={filters.cuartil}
          onChange={e => setFilter('cuartil', e.target.value)}
        >
          <option value="">Todos</option>
          {uniqueValues.cuartiles.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button className="filter-clear" onClick={clearFilters}>
          ✕ Limpiar Filtros
        </button>
      )}
    </div>
  );
}
