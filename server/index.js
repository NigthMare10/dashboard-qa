import express from 'express';
import cors from 'cors';
import { fetchAndProcessData, getCriteriaConfig } from './dataProcessor.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory cache
let cachedData = null;
let cachedSummary = null;
let cachedCriteria = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

async function getData() {
  const now = Date.now();
  if (cachedData && (now - lastFetch) < CACHE_TTL) {
    return { data: cachedData, summary: cachedSummary };
  }
  
  try {
    const result = await fetchAndProcessData();
    cachedData = result.data;
    cachedSummary = result.summary;
    lastFetch = now;
    console.log(`[${new Date().toISOString()}] Data refreshed: ${cachedData.length} evaluations`);
    return { data: cachedData, summary: cachedSummary };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (cachedData) {
      return { data: cachedData, summary: cachedSummary };
    }
    throw error;
  }
}

// GET /api/data — All evaluation data
app.get('/api/data', async (req, res) => {
  try {
    const { data } = await getData();
    res.json({ success: true, data, timestamp: new Date().toISOString(), count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/summary — Pre-computed KPIs
app.get('/api/summary', async (req, res) => {
  try {
    const { summary } = await getData();
    res.json({ success: true, summary, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/criteria — Criteria definitions
app.get('/api/criteria', async (req, res) => {
  try {
    if (!cachedCriteria) {
      cachedCriteria = getCriteriaConfig();
    }
    res.json({ success: true, criteria: cachedCriteria });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 QA Dashboard API running on http://localhost:${PORT}`);
  console.log(`   📊 GET /api/data     — All evaluations`);
  console.log(`   📈 GET /api/summary  — KPI summaries`);
  console.log(`   📋 GET /api/criteria — Criteria definitions\n`);
  // Pre-warm cache
  getData().catch(err => console.error('Initial fetch failed:', err.message));
});
