import React, { useState, useMemo } from 'react';

const CRITERIA_LABELS = {
  NC01: 'Saludo corporativo', NC02: 'Validación de datos', NC03: 'Cierre de llamada',
  NC04: 'Speech de saludo', NC05: 'Speech de despedida', NC06: 'Buena expresión',
  NC07: 'Evita muletillas', NC08: 'Frases de cortesía', NC09: 'Tono de voz',
  NC10: 'Personaliza atención',
  C01: 'Info correcta', C02: 'Info completa', C03: 'Reformulación',
  C04: 'Escucha activa', C05: 'Seguridad y confianza', C06: 'Concentración',
  C07: 'Empatía/Respeto', C08: 'Atención satisfactoria', C09: 'Da beneficios',
  C10: 'Sondeo/Preguntas', C11: 'Sentido de urgencia', C12: 'Manejo objeciones',
  C13: 'Tipificación', C14: 'Tipificación correcta', C15: 'No reitera info',
  C16: 'Uso herramientas', C17: 'No repite innecesario', C18: 'No info confidencial',
  C19: 'Validación Yo Soy Yo', C20: 'Fideliza', C21: 'No precipita promos',
  C22: 'No info procesos', C23: 'No propicia fraude', C24: 'Valida datos cliente',
};

const PAGE_SIZE = 15;

export default function DataTable({ data }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('notaFinal');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const filteredData = useMemo(() => {
    let filtered = data;
    if (search) {
      const s = search.toLowerCase();
      filtered = data.filter(r =>
        (r.asesor || '').toLowerCase().includes(s) ||
        (r.evaluador || '').toLowerCase().includes(s) ||
        (r.supervisor || '').toLowerCase().includes(s) ||
        (r.cliente || '').toLowerCase().includes(s) ||
        String(r.id || '').toLowerCase().includes(s)
      );
    }

    filtered.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pageData = filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getScoreClass = (nota) => {
    if (nota >= 75) return 'score-high';
    if (nota >= 50) return 'score-mid';
    return 'score-low';
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const ncKeys = ['NC01','NC02','NC03','NC04','NC05','NC06','NC07','NC08','NC09','NC10'];
  const cKeys = ['C01','C02','C03','C04','C05','C06','C07','C08','C09','C10','C11','C12',
    'C13','C14','C15','C16','C17','C18','C19','C20','C21','C22','C23','C24'];

  return (
    <div className="table-card animate-in">
      <div className="table-header">
        <div className="table-title">
          <span>📋</span> Detalle de Evaluaciones
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            ({filteredData.length} registros)
          </span>
        </div>
        <input
          type="text"
          className="table-search"
          placeholder="🔍 Buscar asesor, evaluador, supervisor..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th onClick={() => handleSort('asesor')} className={sortKey === 'asesor' ? 'sorted' : ''}>
                Asesor <SortIcon col="asesor" />
              </th>
              <th onClick={() => handleSort('evaluador')} className={sortKey === 'evaluador' ? 'sorted' : ''}>
                Evaluador <SortIcon col="evaluador" />
              </th>
              <th onClick={() => handleSort('supervisor')} className={sortKey === 'supervisor' ? 'sorted' : ''}>
                Supervisor <SortIcon col="supervisor" />
              </th>
              <th onClick={() => handleSort('campana')} className={sortKey === 'campana' ? 'sorted' : ''}>
                Campaña / BU <SortIcon col="campana" />
              </th>
              <th onClick={() => handleSort('tipoEvaluacion')} className={sortKey === 'tipoEvaluacion' ? 'sorted' : ''}>
                Tipo <SortIcon col="tipoEvaluacion" />
              </th>
              <th onClick={() => handleSort('notaFinal')} className={sortKey === 'notaFinal' ? 'sorted' : ''}>
                Nota Final <SortIcon col="notaFinal" />
              </th>
              <th onClick={() => handleSort('cuartil')} className={sortKey === 'cuartil' ? 'sorted' : ''}>
                Cuartil <SortIcon col="cuartil" />
              </th>
              <th onClick={() => handleSort('fechaLlamada')} className={sortKey === 'fechaLlamada' ? 'sorted' : ''}>
                Fecha <SortIcon col="fechaLlamada" />
              </th>
              <th>N° Eval</th>
              <th>Tiempo</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(row => (
              <React.Fragment key={row.id}>
                <tr>
                  <td>
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                    >
                      {expandedId === row.id ? '▼' : '▶'}
                    </button>
                  </td>
                  <td title={row.asesor} style={{ maxWidth: 180 }}>{row.asesor}</td>
                  <td>{row.evaluador}</td>
                  <td>{row.supervisor}</td>
                  <td>{row.campana || '—'}</td>
                  <td>
                    <span className={`tipo-badge ${row.tipoEvaluacion === 'VENTA' ? 'tipo-venta' : 'tipo-no-venta'}`}>
                      {row.tipoEvaluacion}
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(row.notaFinal)}`}>
                      {row.notaFinal}
                    </span>
                  </td>
                  <td>
                    <span className={`cuartil-badge cuartil-${row.cuartil.toLowerCase()}`}>
                      {row.cuartil}
                    </span>
                  </td>
                  <td>{row.fechaLlamada || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{row.evaluacion || '—'}</td>
                  <td>{row.tiempoLlamada || '—'}</td>
                  <td>
                    <span className="obs-preview" title={row.observacionesCalidad}>
                      {row.observacionesCalidad || '—'}
                    </span>
                  </td>
                </tr>
                {expandedId === row.id && (
                  <tr className="expanded-row">
                    <td colSpan={11}>
                      <div style={{ padding: 'var(--space-sm)' }}>
                        {/* Scores summary */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>NO CRÍTICO:</strong> <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{row.totalNoCritico}/10</span></div>
                          <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CRÍTICO BRUTO:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{row.totalCriticoBruto}</span></div>
                          <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SUB-NOTA:</strong> <span style={{ fontWeight: 700 }}>{row.subNota}</span></div>
                          <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>PASA CRÍTICOS:</strong> <span style={{ color: row.pasaCriticos === 'SI' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>{row.pasaCriticos}</span></div>
                          {row.criticosFallados && (
                            <div style={{ flex: '1 1 100%' }}>
                              <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CRÍTICOS FALLADOS:</strong>
                              <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginLeft: '8px' }}>{row.criticosFallados}</span>
                            </div>
                          )}
                        </div>

                        {/* Non-Critical Criteria */}
                        <div className="criteria-section-title">Criterios No Críticos (1 pt c/u)</div>
                        <div className="criteria-grid">
                          {ncKeys.map(key => {
                            const detail = row.criteriaDetail[key];
                            return (
                              <div key={key} className="criteria-item">
                                <div className={`criteria-check ${detail?.cumple ? 'criteria-pass' : 'criteria-fail'}`}>
                                  {detail?.cumple ? '✓' : '✕'}
                                </div>
                                <span className="criteria-name">{CRITERIA_LABELS[key]}</span>
                                <span className={`criteria-pts ${detail?.cumple ? '' : ''}`}
                                  style={{ color: detail?.cumple ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                  {detail?.puntos}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Critical Criteria */}
                        <div className="criteria-section-title" style={{ marginTop: '16px' }}>Criterios Críticos (3.75 pts c/u)</div>
                        <div className="criteria-grid">
                          {cKeys.map(key => {
                            const detail = row.criteriaDetail[key];
                            return (
                              <div key={key} className="criteria-item">
                                <div className={`criteria-check ${detail?.cumple ? 'criteria-pass' : 'criteria-fail'}`}>
                                  {detail?.cumple ? '✓' : '✕'}
                                </div>
                                <span className="criteria-name">{CRITERIA_LABELS[key]}</span>
                                <span className="criteria-pts"
                                  style={{ color: detail?.cumple ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                  {detail?.puntos}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Observations */}
                        {row.observacionesCalidad && (
                          <div style={{ marginTop: '16px' }}>
                            <div className="criteria-section-title">Observaciones de Calidad</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {row.observacionesCalidad}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredData.length)} de {filteredData.length}
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(0)}>⟪</button>
            <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>◀</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = page < 3 ? i : page + i - 2;
              if (pageNum >= totalPages || pageNum < 0) return null;
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>▶</button>
            <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>⟫</button>
          </div>
        </div>
      )}
    </div>
  );
}
