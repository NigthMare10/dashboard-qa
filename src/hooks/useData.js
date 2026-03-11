import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = '/api';
const REFRESH_INTERVAL = 30000; // 30 seconds

export function useData() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial && data.length === 0) setLoading(true);
      
      const [dataRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/data`),
        fetch(`${API_BASE}/summary`),
      ]);

      if (!dataRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const dataJson = await dataRes.json();
      const summaryJson = await summaryRes.json();

      if (dataJson.success) {
        setData(dataJson.data);
        setLastUpdated(new Date(dataJson.timestamp));
        localStorage.setItem('calidad_dashboard_data', JSON.stringify({
          data: dataJson.data, 
          timestamp: dataJson.timestamp 
        }));
      }
      if (summaryJson.success) {
        setSummary(summaryJson.summary);
        localStorage.setItem('calidad_dashboard_summary', JSON.stringify(summaryJson.summary));
      }
      
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      if (data.length === 0) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [data.length]);

  const fetchCriteria = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/criteria`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCriteria(json.criteria);
      }
    } catch (err) {
      console.error('Failed to fetch criteria:', err);
    }
  }, []);

  useEffect(() => {
    // Load from cache first for instant display
    try {
      const cachedData = localStorage.getItem('calidad_dashboard_data');
      const cachedSummary = localStorage.getItem('calidad_dashboard_summary');
      if (cachedData && cachedSummary) {
        const parsed = JSON.parse(cachedData);
        if (parsed.data && parsed.data.length > 0) {
          setData(parsed.data);
          setLastUpdated(new Date(parsed.timestamp));
          setSummary(JSON.parse(cachedSummary));
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Cache read error', e);
    }

    fetchData(true);
    fetchCriteria();
    
    intervalRef.current = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, fetchCriteria]);

  const refresh = useCallback(() => fetchData(false), [fetchData]);

  return { data, summary, criteria, loading, error, lastUpdated, refresh };
}

export function useFilters(data) {
  const [filters, setFilters] = useState({
    evaluador: '',
    supervisor: '',
    asesor: '',
    tipoEvaluacion: '',
    campana: '',
    cuartil: '',
  });

  const filteredData = data.filter(row => {
    if (filters.evaluador && row.evaluador !== filters.evaluador) return false;
    if (filters.supervisor && row.supervisor !== filters.supervisor) return false;
    if (filters.asesor && row.asesor !== filters.asesor) return false;
    if (filters.tipoEvaluacion && row.tipoEvaluacion !== filters.tipoEvaluacion) return false;
    if (filters.campana && row.campana !== filters.campana) return false;
    if (filters.cuartil && row.cuartil !== filters.cuartil) return false;
    return true;
  });

  const uniqueValues = {
    evaluadores: [...new Set(data.map(r => r.evaluador).filter(Boolean))].sort(),
    supervisores: [...new Set(data.map(r => r.supervisor).filter(Boolean))].sort(),
    asesores: [...new Set(data.map(r => r.asesor).filter(Boolean))].sort(),
    tipos: [...new Set(data.map(r => r.tipoEvaluacion).filter(Boolean))].sort(),
    campanas: [...new Set(data.map(r => r.campana).filter(Boolean))].sort(),
    cuartiles: [...new Set(data.map(r => r.cuartil).filter(Boolean))].sort(),
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ evaluador: '', supervisor: '', asesor: '', tipoEvaluacion: '', campana: '', cuartil: '' });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return { filters, filteredData, uniqueValues, setFilter, clearFilters, hasActiveFilters };
}

// Recompute summary from filtered data
export function computeFilteredSummary(filteredData) {
  const total = filteredData.length;
  if (total === 0) {
    return { total: 0, avgNota: 0, passRate: 0, passCount: 0, q1Count: 0, q4Count: 0, scoreDistribution: [0,0,0,0], byEvaluator: {}, bySupervisor: {}, byTipo: {}, criteriaCompliance: {}, byDate: {} };
  }

  const avgNota = filteredData.reduce((s, r) => s + r.notaFinal, 0) / total;
  const passCount = filteredData.filter(r => r.pasaCriticos === 'SI').length;
  const passRate = (passCount / total) * 100;
  const q1Count = filteredData.filter(r => r.cuartil === 'Q1').length;
  const q4Count = filteredData.filter(r => r.cuartil === 'Q4').length;

  const buckets = [0, 0, 0, 0];
  filteredData.forEach(r => {
    if (r.notaFinal <= 25) buckets[0]++;
    else if (r.notaFinal <= 50) buckets[1]++;
    else if (r.notaFinal <= 75) buckets[2]++;
    else buckets[3]++;
  });

  // By evaluator
  const byEvaluator = {};
  filteredData.forEach(r => {
    if (!byEvaluator[r.evaluador]) byEvaluator[r.evaluador] = { total: 0, sumNota: 0, passCount: 0 };
    byEvaluator[r.evaluador].total++;
    byEvaluator[r.evaluador].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byEvaluator[r.evaluador].passCount++;
  });
  Object.keys(byEvaluator).forEach(k => {
    byEvaluator[k].avgNota = byEvaluator[k].sumNota / byEvaluator[k].total;
    byEvaluator[k].passRate = (byEvaluator[k].passCount / byEvaluator[k].total) * 100;
  });

  // By supervisor
  const bySupervisor = {};
  filteredData.forEach(r => {
    if (!bySupervisor[r.supervisor]) bySupervisor[r.supervisor] = { total: 0, sumNota: 0, passCount: 0 };
    bySupervisor[r.supervisor].total++;
    bySupervisor[r.supervisor].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') bySupervisor[r.supervisor].passCount++;
  });
  Object.keys(bySupervisor).forEach(k => {
    bySupervisor[k].avgNota = bySupervisor[k].sumNota / bySupervisor[k].total;
    bySupervisor[k].passRate = (bySupervisor[k].passCount / bySupervisor[k].total) * 100;
  });

  // By tipo
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

  // By campana
  const byCampana = {};
  filteredData.forEach(r => {
    if (!byCampana[r.campana]) byCampana[r.campana] = { total: 0, sumNota: 0, passCount: 0 };
    byCampana[r.campana].total++;
    byCampana[r.campana].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byCampana[r.campana].passCount++;
  });
  Object.keys(byCampana).forEach(k => {
    byCampana[k].avgNota = byCampana[k].sumNota / byCampana[k].total;
    byCampana[k].passRate = (byCampana[k].passCount / byCampana[k].total) * 100;
  });

  // Criteria compliance
  const criteriaIds = ['NC01','NC02','NC03','NC04','NC05','NC06','NC07','NC08','NC09','NC10',
    'C01','C02','C03','C04','C05','C06','C07','C08','C09','C10','C11','C12',
    'C13','C14','C15','C16','C17','C18','C19','C20','C21','C22','C23','C24'];
  const criteriaCompliance = {};
  criteriaIds.forEach(id => {
    const compliant = filteredData.filter(r => r.criteriaDetail[id] && r.criteriaDetail[id].cumple).length;
    criteriaCompliance[id] = {
      compliance: total > 0 ? (compliant / total) * 100 : 0,
      compliant,
      total,
    };
  });

  // By date
  const byDate = {};
  filteredData.forEach(r => {
    const d = r.fechaLlamada || 'Sin Fecha';
    if (!byDate[d]) byDate[d] = { total: 0, sumNota: 0, passCount: 0 };
    byDate[d].total++;
    byDate[d].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byDate[d].passCount++;
  });
  Object.keys(byDate).forEach(k => {
    byDate[k].avgNota = byDate[k].sumNota / byDate[k].total;
  });

  return {
    total,
    avgNota: Math.round(avgNota * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    passCount,
    q1Count,
    q4Count,
    scoreDistribution: buckets,
    byEvaluator,
    bySupervisor,
    byCampana,
    byTipo,
    criteriaCompliance,
    byDate,
  };
}
