import Papa from 'papaparse';

const SPREADSHEET_ID = '1zFpeOpQaeyvGLuClLbwJQV05wvd7SYUcyvnqo-4250w';
const SHEET_GID = '1017605720'; // Resultados sheet

const RESULTADOS_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
const FORMS_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&sheet=Form%20Responses%201`;

// Criteria configuration (from Config_Criterios sheet)
const CRITERIA_CONFIG = [
  { id: 'NC01', type: 'NO_CRITICO', category: '1. ¿Cumple protocolo?', name: 'Saludo corporativo', description: 'Saludo según el speech definido', points: 1 },
  { id: 'NC02', type: 'NO_CRITICO', category: null, name: 'Validación de datos', description: 'El asesor debe validar datos según el speech', points: 1 },
  { id: 'NC03', type: 'NO_CRITICO', category: null, name: 'Al finalizar la atención corta la llamada', description: 'Solicita al cliente finalizar la llamada de manera cordial', points: 1 },
  { id: 'NC04', type: 'NO_CRITICO', category: null, name: 'Speech de saludo', description: 'Se presenta con su nombre y solicita información del cliente', points: 1 },
  { id: 'NC05', type: 'NO_CRITICO', category: null, name: 'Speech de despedida', description: 'Se despide de manera institucional', points: 1 },
  { id: 'NC06', type: 'NO_CRITICO', category: '2. ¿Habilidad de comunicación?', name: 'Buena expresión o modulación', description: 'Tono de voz, modulación correcta, evitar muletillas', points: 1 },
  { id: 'NC07', type: 'NO_CRITICO', category: null, name: 'Evita uso de muletillas', description: null, points: 1 },
  { id: 'NC08', type: 'NO_CRITICO', category: null, name: 'Utiliza frases de cortesía', description: null, points: 1 },
  { id: 'NC09', type: 'NO_CRITICO', category: null, name: 'Usa un tono de voz adecuado', description: null, points: 1 },
  { id: 'NC10', type: 'NO_CRITICO', category: null, name: 'Personaliza la atención', description: 'Personaliza un mínimo de dos ocasiones durante la llamada', points: 1 },
  { id: 'C01', type: 'CRITICO', errorType: 'Error Crítico de Usuario Final', category: '1. ¿Brinda información correcta y completa?', name: 'Brinda información correcta', description: 'Información de producto, precio, fechas de pago, contrato', points: 3.75 },
  { id: 'C02', type: 'CRITICO', category: null, name: 'Brinda información completa', description: 'Información de producto, precio, fechas de pago, contrato', points: 3.75 },
  { id: 'C03', type: 'CRITICO', category: null, name: 'No hace reformulación', description: 'Reformulación correcta y completa en caso de venta', points: 3.75 },
  { id: 'C04', type: 'CRITICO', category: '2. ¿Tiene escucha activa?', name: 'Escucha sin interrumpir al cliente', description: 'Cede la palabra, no interrumpe', points: 3.75 },
  { id: 'C05', type: 'CRITICO', category: null, name: 'Muestra seguridad y confianza', description: 'Sin pausas prolongadas o consultas excesivas', points: 3.75 },
  { id: 'C06', type: 'CRITICO', category: null, name: 'Se mantiene concentrado en la atención', description: 'No se distrae durante la gestión', points: 3.75 },
  { id: 'C07', type: 'CRITICO', category: '3. ¿Es respetuoso con el cliente?', name: 'Muestra empatía / Sin maltrato', description: 'Empatía, interés, no sarcástico, no ofensivo', points: 3.75 },
  { id: 'C08', type: 'CRITICO', category: null, name: 'Cliente atendido satisfactoriamente', description: 'Resuelve todas consultas, no corta la llamada prematuramente', points: 3.75 },
  { id: 'C09', type: 'CRITICO', errorType: 'Error Crítico de Negocio', category: '1. ¿Sigue proceso de venta?', name: 'No da beneficios', description: 'Debe brindar beneficios en todas las llamadas de contacto', points: 3.75 },
  { id: 'C10', type: 'CRITICO', category: null, name: 'No sondea - no hace preguntas', description: 'Debe hacer al menos una pregunta al cliente', points: 3.75 },
  { id: 'C11', type: 'CRITICO', category: null, name: 'No transmite sentido de urgencia', description: 'Intenta cerrar venta en el contacto actual', points: 3.75 },
  { id: 'C12', type: 'CRITICO', category: null, name: 'No maneja objeciones', description: 'Maneja al menos 3 objeciones por llamada', points: 3.75 },
  { id: 'C13', type: 'CRITICO', category: '2. ¿Documenta y tipifica en sistemas?', name: 'Registra gestión (tipifica)', description: 'Registra en todas las herramientas', points: 3.75 },
  { id: 'C14', type: 'CRITICO', category: null, name: 'Registra gestión de forma correcta', description: 'Tipificación completa y correcta', points: 3.75 },
  { id: 'C15', type: 'CRITICO', category: '3. ¿Manejo apropiado de la llamada?', name: 'Reitera pedido de información', description: 'Solicita información ya proporcionada', points: 3.75 },
  { id: 'C16', type: 'CRITICO', category: null, name: 'Uso correcto de herramientas', description: 'Valida correctamente en plataformas', points: 3.75 },
  { id: 'C17', type: 'CRITICO', category: null, name: 'Repite información innecesariamente', description: 'Repite sin que el cliente lo solicite', points: 3.75 },
  { id: 'C18', type: 'CRITICO', errorType: 'Error Crítico de Cumplimiento', category: '1. ¿Cumple aspectos legales?', name: 'No brinda info confidencial', description: 'No brinda información confidencial del titular', points: 3.75 },
  { id: 'C19', type: 'CRITICO', category: null, name: 'Realiza validación Yo Soy Yo', description: 'Validación según proceso definido', points: 3.75 },
  { id: 'C20', type: 'CRITICO', category: null, name: 'Fideliza', description: 'Procura retención del cliente', points: 3.75 },
  { id: 'C21', type: 'CRITICO', category: '2. ¿Expone información confidencial?', name: 'No precipita promociones', description: 'No brinda promociones no vigentes', points: 3.75 },
  { id: 'C22', type: 'CRITICO', category: null, name: 'No brinda info de procesos internos', description: 'No detalla problemas internos al cliente', points: 3.75 },
  { id: 'C23', type: 'CRITICO', category: null, name: 'No propicia fraude', description: 'No facilita información para beneficio indebido', points: 3.75 },
  { id: 'C24', type: 'CRITICO', category: '3. ¿Valida datos del cliente?', name: 'No valida datos del cliente', description: 'DNI, nombre, fecha nacimiento, dirección, correo', points: 3.75 },
];

function getCriteriaConfig() {
  return CRITERIA_CONFIG;
}

// Normalize names: trim whitespace, title case
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/\t/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Convert Excel serial date to JS Date string
function excelDateToString(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400000);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Convert Excel time fraction to HH:MM:SS
function excelTimeToString(timeFraction) {
  if (!timeFraction || typeof timeFraction !== 'number') return '00:00:00';
  const totalSeconds = Math.round(timeFraction * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function processRow(row) {
  // Build criteria detail
  const criteriaDetail = {};
  CRITERIA_CONFIG.forEach(c => {
    const respKey = `${c.id}_RESPUESTA`;
    const ptsKey = `${c.id}_PUNTOS`;
    criteriaDetail[c.id] = {
      respuesta: row[respKey] || '',
      puntos: parseFloat(row[ptsKey]) || 0,
      cumple: (row[respKey] || '').toLowerCase().includes('si cumple'),
    };
  });

  return {
    id: row.ID_EVALUACION || '',
    timestamp: row.TIMESTAMP || '',
    area: (row.AREA || '').trim(),
    campana: (row['CAMPAÑA'] || row.CAMPANA || '').trim(),
    evaluador: normalizeName(row.EVALUADOR_QA),
    supervisor: normalizeName(row.SUPERVISOR),
    asesor: normalizeName(row.ASESOR),
    tipoEvaluacion: (row.TIPO_EVALUACION || '').trim().toUpperCase(),
    campana: (row.BU || row.CAMPANA || row['CAMPAÑA'] || '').trim().toUpperCase(),
    nombreCliente: (row.NOMBRE_CLIENTE || '').trim(),
    dniCliente: (row.DNI_CLIENTE || '').toString().trim(),
    fechaLlamada: excelDateToString(parseFloat(row.FECHA_LLAMADA)),
    telefonoCliente: (row.TELEFONO_CLIENTE || '').toString().trim(),
    tiempoLlamada: excelTimeToString(parseFloat(row.TIEMPO_LLAMADA)),
    observacionesCalidad: (row.OBSERVACIONES_CALIDAD || '').trim(),
    observacionesSupervisor: (row.OBSERVACIONES_SUPERVISOR || '').trim(),
    compromiso: (row.COMPROMISO || '').trim(),
    totalNoCritico: parseFloat(row.TOTAL_NO_CRITICO) || 0,
    totalCriticoBruto: parseFloat(row.TOTAL_CRITICO_BRUTO) || 0,
    subNota: parseFloat(row.SUB_NOTA) || 0,
    pasaCriticos: (row.PASA_CRITICOS || '').trim().toUpperCase(),
    notaFinal: parseFloat(row.NOTA_FINAL) || 0,
    cuartil: (row.CUARTIL || '').trim().toUpperCase(),
    criticosFallados: (row.CRITICOS_FALLADOS || '').trim(),
    noCriticosFallados: (row.NO_CRITICOS_FALLADOS || '').trim(),
    totalCriticosFallados: parseInt(row.TOTAL_CRITICOS_FALLADOS) || 0,
    totalNoCriticosFallados: parseInt(row.TOTAL_NO_CRITICOS_FALLADOS) || 0,
    criteriaDetail,
  };
}

function computeSummary(data) {
  const total = data.length;
  if (total === 0) {
    return { total: 0, avgNota: 0, passRate: 0, q1Count: 0, q4Count: 0, byEvaluator: {}, bySupervisor: {}, byAsesor: {}, byTipo: {}, scoreDistribution: [], criteriaCompliance: {} };
  }

  // Average score
  const avgNota = data.reduce((s, r) => s + r.notaFinal, 0) / total;

  // Pass rate (PASA_CRITICOS === 'SI')
  const passCount = data.filter(r => r.pasaCriticos === 'SI').length;
  const passRate = (passCount / total) * 100;

  // Quartile distribution
  const q1Count = data.filter(r => r.cuartil === 'Q1').length;
  const q4Count = data.filter(r => r.cuartil === 'Q4').length;

  // Score distribution buckets
  const buckets = [0, 0, 0, 0]; // 0-25, 25-50, 50-75, 75-100
  data.forEach(r => {
    if (r.notaFinal <= 25) buckets[0]++;
    else if (r.notaFinal <= 50) buckets[1]++;
    else if (r.notaFinal <= 75) buckets[2]++;
    else buckets[3]++;
  });

  // Group by evaluator
  const byEvaluator = {};
  data.forEach(r => {
    if (!byEvaluator[r.evaluador]) byEvaluator[r.evaluador] = { total: 0, sumNota: 0, passCount: 0 };
    byEvaluator[r.evaluador].total++;
    byEvaluator[r.evaluador].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byEvaluator[r.evaluador].passCount++;
  });
  Object.keys(byEvaluator).forEach(k => {
    byEvaluator[k].avgNota = byEvaluator[k].sumNota / byEvaluator[k].total;
    byEvaluator[k].passRate = (byEvaluator[k].passCount / byEvaluator[k].total) * 100;
  });

  // Group by supervisor
  const bySupervisor = {};
  data.forEach(r => {
    if (!bySupervisor[r.supervisor]) bySupervisor[r.supervisor] = { total: 0, sumNota: 0, passCount: 0 };
    bySupervisor[r.supervisor].total++;
    bySupervisor[r.supervisor].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') bySupervisor[r.supervisor].passCount++;
  });
  Object.keys(bySupervisor).forEach(k => {
    bySupervisor[k].avgNota = bySupervisor[k].sumNota / bySupervisor[k].total;
    bySupervisor[k].passRate = (bySupervisor[k].passCount / bySupervisor[k].total) * 100;
  });

  // Group by asesor (top 15 by count)
  const byAsesor = {};
  data.forEach(r => {
    if (!byAsesor[r.asesor]) byAsesor[r.asesor] = { total: 0, sumNota: 0, passCount: 0 };
    byAsesor[r.asesor].total++;
    byAsesor[r.asesor].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byAsesor[r.asesor].passCount++;
  });
  Object.keys(byAsesor).forEach(k => {
    byAsesor[k].avgNota = byAsesor[k].sumNota / byAsesor[k].total;
    byAsesor[k].passRate = (byAsesor[k].passCount / byAsesor[k].total) * 100;
  });

  // By BU / Campaña
  const byCampana = {};
  data.forEach(r => {
    const c = r.campana || 'Sin Campaña';
    if (!byCampana[c]) byCampana[c] = { total: 0, sumNota: 0, passCount: 0 };
    byCampana[c].total++;
    byCampana[c].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byCampana[c].passCount++;
  });
  Object.keys(byCampana).forEach(k => {
    byCampana[k].avgNota = byCampana[k].sumNota / byCampana[k].total;
    byCampana[k].passRate = (byCampana[k].passCount / byCampana[k].total) * 100;
  });

  // By tipo evaluacion
  const byTipo = {};
  data.forEach(r => {
    if (!byTipo[r.tipoEvaluacion]) byTipo[r.tipoEvaluacion] = { total: 0, sumNota: 0, passCount: 0 };
    byTipo[r.tipoEvaluacion].total++;
    byTipo[r.tipoEvaluacion].sumNota += r.notaFinal;
    if (r.pasaCriticos === 'SI') byTipo[r.tipoEvaluacion].passCount++;
  });
  Object.keys(byTipo).forEach(k => {
    byTipo[k].avgNota = byTipo[k].sumNota / byTipo[k].total;
    byTipo[k].passRate = (byTipo[k].passCount / byTipo[k].total) * 100;
  });

  // Criteria compliance %
  const criteriaCompliance = {};
  CRITERIA_CONFIG.forEach(c => {
    const compliant = data.filter(r => r.criteriaDetail[c.id] && r.criteriaDetail[c.id].cumple).length;
    criteriaCompliance[c.id] = {
      name: c.name,
      type: c.type,
      compliance: total > 0 ? (compliant / total) * 100 : 0,
      compliant,
      total,
    };
  });

  // Trend by date
  const byDate = {};
  data.forEach(r => {
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
    byAsesor,
    byCampana,
    byTipo,
    criteriaCompliance,
    byDate,
  };
}

async function fetchAndProcessData() {
  const [resResultados, resForms] = await Promise.all([
    fetch(RESULTADOS_URL),
    fetch(FORMS_URL)
  ]);
  
  if (!resResultados.ok) throw new Error(`Failed to fetch Resultados: ${resResultados.status}`);
  if (!resForms.ok) throw new Error(`Failed to fetch Forms: ${resForms.status}`);
  
  const csvResultados = await resResultados.text();
  const csvForms = await resForms.text();
  
  const parsedRes = Papa.parse(csvResultados, { header: true, skipEmptyLines: true });
  const parsedForms = Papa.parse(csvForms, { header: true, skipEmptyLines: true });

  // Map "BU" from Forms to Resultados by row index
  const mergedData = parsedRes.data.map((row, index) => {
    const formRow = parsedForms.data[index];
    if (formRow) {
      row.BU = formRow.BU || formRow.bu || formRow['BU '] || '';
    }
    return row;
  });

  const data = mergedData
    .filter(row => row.ID_EVALUACION && row.ID_EVALUACION.trim())
    .map(processRow);

  const summary = computeSummary(data);

  return { data, summary };
}

export { fetchAndProcessData, getCriteriaConfig };
