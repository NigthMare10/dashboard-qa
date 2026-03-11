import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';

const SPREADSHEET_ID = '1zFpeOpQaeyvGLuClLbwJQV05wvd7SYUcyvnqo-4250w';
// Direct CSV Export URLs
const RESULTADOS_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Resultados`;
const FORMS_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Form%20Responses%201`;

const REFRESH_INTERVAL = 30000;

// Shared Criteria config
const CRITERIA_CONFIG = [
  { id: 'NC01', name: 'Saludo corporativo' },
  { id: 'NC02', name: 'Validación de datos' },
  { id: 'NC03', name: 'Al finalizar la atención corta la llamada' },
  { id: 'NC04', name: 'Speech de saludo' },
  { id: 'NC05', name: 'Speech de despedida' },
  { id: 'NC06', name: 'Buena expresión o modulación' },
  { id: 'NC07', name: 'Evita uso de muletillas' },
  { id: 'NC08', name: 'Utiliza frases de cortesía' },
  { id: 'NC09', name: 'Usa un tono de voz adecuado' },
  { id: 'NC10', name: 'Personaliza la atención' },
  { id: 'C01', name: 'Brinda información correcta' },
  { id: 'C02', name: 'Brinda información completa' },
  { id: 'C03', name: 'No hace reformulación' },
  { id: 'C04', name: 'Escucha sin interrumpir al cliente' },
  { id: 'C05', name: 'Muestra seguridad y confianza' },
  { id: 'C06', name: 'Se mantiene concentrado en la atención' },
  { id: 'C07', name: 'Muestra empatía / Sin maltrato' },
  { id: 'C08', name: 'Cliente atendido satisfactoriamente' },
  { id: 'C09', name: 'No da beneficios' },
  { id: 'C10', name: 'No sondea - no hace preguntas' },
  { id: 'C11', name: 'No transmite sentido de urgencia' },
  { id: 'C12', name: 'No maneja objeciones' },
  { id: 'C13', name: 'Registra gestión (tipifica)' },
  { id: 'C14', name: 'Registra gestión de forma correcta' },
  { id: 'C15', name: 'Reitera pedido de información' },
  { id: 'C16', name: 'Uso correcto de herramientas' },
  { id: 'C17', name: 'Repite información innecesariamente' },
  { id: 'C18', name: 'No brinda info confidencial' },
  { id: 'C19', name: 'Realiza validación Yo Soy Yo' },
  { id: 'C20', name: 'Fideliza' },
  { id: 'C21', name: 'No precipita promociones' },
  { id: 'C22', name: 'No brinda info de procesos internos' },
  { id: 'C23', name: 'No propicia fraude' },
  { id: 'C24', name: 'No valida datos del cliente' },
];

function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Logic migrated from Backend for parsing Excel-format CSV exported rows
function processRawRow(row, buValue) {
  const criteriaDetail = {};
  CRITERIA_CONFIG.forEach(c => {
    const respKey = `${c.id}_RESPUESTA`;
    const val = row[respKey] || '';
    criteriaDetail[c.id] = {
      puntos: parseFloat(row[`${c.id}_PUNTOS`]) || 0,
      respuesta: val,
      cumple: val.toLowerCase().includes('si cumple')
    };
  });

  return {
    id: row.ID_EVALUACION || Math.random().toString(36).substr(2, 9),
    evaluador: normalizeName(row.EVALUADOR_QA || row['Evaluador QA']),
    supervisor: normalizeName(row.SUPERVISOR || row['Supervisor']),
    asesor: normalizeName(row.ASESOR || row['Asesor']),
    tipoEvaluacion: (row.TIPO_EVALUACION || row['Tipo de Evaluacion'] || 'VENTA').toUpperCase(),
    campana: (buValue?.bu || row.BU || 'SIN CAMPAÑA').toUpperCase(),
    notaFinal: parseFloat(row.NOTA_FINAL || row['Nota Final']) || 0,
    pasaCriticos: (row.PASA_CRITICOS || row['Paso Criticos?'] || 'NO').toUpperCase(),
    cuartil: (row.CUARTIL || row['Cuartil'] || 'Q2/Q3').toUpperCase(),
    fechaLlamada: row.FECHA_LLAMADA || row['Fecha de la llamada'] || '',
    observacionesCalidad: row.OBSERVACIONES_CALIDAD || row['OBSERVACIONES'] || row['OBSERVACIONES '] || row['Observaciones'] || '',
    evaluacion: buValue?.evaluacion || row.EVALUACION || row['EVALUACION'] || row['No. Evaluacion'] || '',
    cliente: row.NOMBRE_CLIENTE || row['CLIENTE'] || 'N/A',
    criteriaDetail
  };
}

export function useData() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [criteria, setCriteria] = useState(CRITERIA_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial && data.length === 0) setLoading(true);

      const [resRes, resForms] = await Promise.all([
        fetch(RESULTADOS_URL),
        fetch(FORMS_URL)
      ]);

      const csvRes = await resRes.text();
      const csvForms = await resForms.text();

      const parsedRes = Papa.parse(csvRes, { header: true, skipEmptyLines: true }).data;
      const parsedForms = Papa.parse(csvForms, { header: true, skipEmptyLines: true }).data;

      const processed = parsedRes
        .filter(r => (r.ID_EVALUACION || r['ID_EVALUACION'] || r['Evaluador QA']))
        .map((r, i) => {
          const formRow = parsedForms[i] || {};
          const bu = formRow.BU || formRow.bu || '';
          const evaluacion = formRow['Evaluacion '] || formRow.Evaluacion || formRow.evaluacion || formRow['No.'] || '';
          return processRawRow(r, { bu, evaluacion });
        });

      const computedSummary = computeFilteredSummary(processed);

      setData(processed);
      setSummary(computedSummary);
      setLastUpdated(new Date());

      localStorage.setItem('calidad_dashboard_data', JSON.stringify({
        data: processed,
        timestamp: new Date().getTime()
      }));
      localStorage.setItem('calidad_dashboard_summary', JSON.stringify(computedSummary));
      setError(null);
    } catch (err) {
      console.error(err);
      if (data.length === 0) setError("Error al conectar con Google Sheets.");
    } finally {
      setLoading(false);
    }
  }, [data.length]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('calidad_dashboard_data');
      const cachedSum = localStorage.getItem('calidad_dashboard_summary');
      if (cached && cachedSum) {
        const p = JSON.parse(cached);
        setData(p.data);
        setLastUpdated(new Date(p.timestamp));
        setSummary(JSON.parse(cachedSum));
        setLoading(false);
      }
    } catch(e){}
    
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  const refresh = () => fetchData(false);

  return { data, summary, criteria, loading, error, lastUpdated, refresh };
}

export function useFilters(data) {
  const [filters, setFilters] = useState({ evaluador: '', supervisor: '', asesor: '', tipoEvaluacion: '', campana: '', cuartil: '', evaluacion: '' });

  const filteredData = data.filter(row => {
    if (filters.evaluador && row.evaluador !== filters.evaluador) return false;
    if (filters.supervisor && row.supervisor !== filters.supervisor) return false;
    if (filters.asesor && row.asesor !== filters.asesor) return false;
    if (filters.tipoEvaluacion && row.tipoEvaluacion !== filters.tipoEvaluacion) return false;
    if (filters.campana && row.campana !== filters.campana) return false;
    if (filters.cuartil && row.cuartil !== filters.cuartil) return false;
    if (filters.evaluacion && row.evaluacion !== filters.evaluacion) return false;
    return true;
  });

  const uniqueValues = {
    evaluadores: Array.from(new Set(data.map(r => r.evaluador))).filter(Boolean).sort(),
    supervisores: Array.from(new Set(data.map(r => r.supervisor))).filter(Boolean).sort(),
    asesores: Array.from(new Set(data.map(r => r.asesor))).filter(Boolean).sort(),
    tipos: Array.from(new Set(data.map(r => r.tipoEvaluacion))).filter(Boolean).sort(),
    campanas: Array.from(new Set(data.map(r => r.campana))).filter(Boolean).sort(),
    cuartiles: Array.from(new Set(data.map(r => r.cuartil))).filter(Boolean).sort(),
    evaluaciones: Array.from(new Set(data.map(r => r.evaluacion))).filter(Boolean).sort(),
  };

  const setFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));
  const clearFilters = () => setFilters({ evaluador: '', supervisor: '', asesor: '', tipoEvaluacion: '', campana: '', cuartil: '', evaluacion: '' });
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return { filters, filteredData, uniqueValues, setFilter, clearFilters, hasActiveFilters };
}

export function computeFilteredSummary(filteredData) {
  const total = filteredData.length;
  if (total === 0) return { total: 0, avgNota: 0, passRate: 0, scoreDistribution: [0,0,0,0], byEvaluator: {}, bySupervisor: {}, criteriaCompliance: {} };

  const avgNota = filteredData.reduce((s, r) => s + r.notaFinal, 0) / total;
  const passCount = filteredData.filter(r => r.pasaCriticos === 'SI').length;
  const passRate = (passCount / total) * 100;

  const buckets = [0, 0, 0, 0];
  filteredData.forEach(r => {
    if (r.notaFinal <= 25) buckets[0]++;
    else if (r.notaFinal <= 50) buckets[1]++;
    else if (r.notaFinal <= 75) buckets[2]++;
    else buckets[3]++;
  });

  const byEvaluator = {};
  filteredData.forEach(r => {
    if (!byEvaluator[r.evaluador]) byEvaluator[r.evaluador] = { total: 0, sumNota: 0, passCount: 0 };
    byEvaluator[r.evaluador].total++;
    byEvaluator[r.evaluador].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byEvaluator[r.evaluador].passCount++;
  });
  Object.keys(byEvaluator).forEach(k => {
    byEvaluator[k].avgNota = byEvaluator[k].sumNota / byEvaluator[k].total;
  });

  const bySupervisor = {};
  filteredData.forEach(r => {
    if (!bySupervisor[r.supervisor]) bySupervisor[r.supervisor] = { total: 0, sumNota: 0, passCount: 0 };
    bySupervisor[r.supervisor].total++;
    bySupervisor[r.supervisor].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') bySupervisor[r.supervisor].passCount++;
  });
  Object.keys(bySupervisor).forEach(k => { bySupervisor[k].avgNota = bySupervisor[k].sumNota / bySupervisor[k].total; });

  const criteriaCompliance = {};
  CRITERIA_CONFIG.forEach(c => {
    const compliant = filteredData.filter(r => r.criteriaDetail[c.id] && r.criteriaDetail[c.id].cumple).length;
    criteriaCompliance[c.id] = { compliance: (compliant / total) * 100, compliant, total };
  });

  const byTipo = {};
  filteredData.forEach(r => {
    if (!byTipo[r.tipoEvaluacion]) byTipo[r.tipoEvaluacion] = { total: 0, sumNota: 0, passCount: 0 };
    byTipo[r.tipoEvaluacion].total++;
    byTipo[r.tipoEvaluacion].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byTipo[r.tipoEvaluacion].passCount++;
  });
  Object.keys(byTipo).forEach(k => {
    byTipo[k].avgNota = byTipo[k].sumNota / byTipo[k].total;
    byTipo[k].passRate = (byTipo[k].passCount / byTipo[k].total) * 100;
  });

  return {
    total,
    avgNota: Math.round(avgNota * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    scoreDistribution: buckets,
    byEvaluator,
    bySupervisor,
    byTipo,
    criteriaCompliance,
    q1Count: filteredData.filter(r => r.cuartil === 'Q1').length,
    q4Count: filteredData.filter(r => r.cuartil === 'Q4').length,
  };
}
