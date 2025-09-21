// -------- Tabs (Research vs Brief)
const tabResearch = document.getElementById('tab-research');
const tabBrief = document.getElementById('tab-brief');
const viewResearch = document.getElementById('view-research');
const viewBrief = document.getElementById('view-brief');

function setTab(which) {
  const a = which === 'research';
  tabResearch.classList.toggle('active', a);
  tabBrief.classList.toggle('active', !a);
  viewResearch.classList.toggle('active', a);
  viewBrief.classList.toggle('active', !a);
}

tabResearch.addEventListener('click', () => setTab('research'));
tabBrief.addEventListener('click', () => setTab('brief'));

// -------- Map (Leaflet)
const map = L.map('map').setView([17.5, 70.0], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Mock ARGO-like floats (id, lat, lon)
const mockFloats = [
  { id: '2903328', lat: 19.0, lon: 67.0 },
  { id: '3901972', lat: 14.5, lon: 72.3 }
];

let markerLayer = L.layerGroup().addTo(map);
function renderMarkers(floats) {
  markerLayer.clearLayers();
  floats.forEach(f => L.marker([f.lat, f.lon]).addTo(markerLayer).bindPopup(`Float ${f.id}`));
}
renderMarkers(mockFloats);

// -------- Temperature Profile (Plotly)
// Depth on x (m), Temperature on y (°C) for a profile-like curve
const mockProfile = {
  x: [0, 200, 500, 1000, 1500, 2000], // depth (m)
  y: [28.2, 26.1, 20.0, 12.5, 7.2, 4.0], // temperature (°C)
  name: 'Temp (°C)'
};

function renderProfile(series) {
  Plotly.newPlot('chart', [{
    x: series.x, y: series.y, mode: 'lines+markers', name: series.name, line: { color: '#0ea5a8' }
  }], {
    title: 'Temperature vs Depth',
    height: 280,
    margin: { t: 40, r: 10, l: 40, b: 40 },
    xaxis: { title: 'Depth (m)' },
    yaxis: { title: 'Temperature (°C)' },
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)'
  }, { displayModeBar: false, responsive: true });
}
renderProfile(mockProfile);

// -------- Brief summary (for non-specialists)
function computeBrief(floats, series) {
  const count = floats.length;
  const maxT = Math.max(...series.y);
  const minT = Math.min(...series.y);
  const avgT = (series.y.reduce((s,v)=>s+v,0) / series.y.length).toFixed(1);
  const region = 'Arabian Sea'; // placeholder; later infer from query/BBOX
  return [
    `<span class="chip">Region</span> ${region}`,
    `<span class="chip">Floats</span> ${count}`,
    `<span class="chip">Temperature</span> avg ${avgT}°C, min ${minT.toFixed(1)}°C, max ${maxT.toFixed(1)}°C`
  ];
}

function renderBrief(lines) {
  const el = document.getElementById('brief');
  el.innerHTML = '';
  lines.forEach(t => {
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = t;
    el.appendChild(div);
  });
}
renderBrief(computeBrief(mockFloats, mockProfile));

// -------- Query + Save (localStorage)
const $ = s => document.querySelector(s);

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem('saved') || '[]');
    const list = $('#savedList');
    list.innerHTML = '';
    saved.forEach(sv => {
      const li = document.createElement('li');
      li.textContent = `${new Date(sv.when).toLocaleString()} — ${sv.q?.prompt || '(no prompt)'}`;
      list.appendChild(li);
    });
  } catch (e) {
    console.warn('Storage unavailable', e);
  }
}
loadSaved();

document.getElementById('runBtn').addEventListener('click', async () => {
  const q = {
    prompt: $('#prompt').value.trim(),
    depth: [Number($('#depthMin').value || 0), Number($('#depthMax').value || 2000)],
    date: [$('#dateStart').value, $('#dateEnd').value]
  };
  try { localStorage.setItem('lastQuery', JSON.stringify(q)); } catch {}

  // For now: re-use mock outputs. Later: replace with fetch to backend.
  map.setView([17.5, 70.0], 4);
  renderMarkers(mockFloats);
  renderProfile(mockProfile);
  renderBrief(computeBrief(mockFloats, mockProfile));
});

document.getElementById('saveBtn').addEventListener('click', () => {
  try {
    const q = JSON.parse(localStorage.getItem('lastQuery') || 'null');
    if (!q) return alert('Run a query first.');
    const saved = JSON.parse(localStorage.getItem('saved') || '[]');
    saved.push({ when: Date.now(), q });
    localStorage.setItem('saved', JSON.stringify(saved));
    loadSaved();
    alert('Saved');
  } catch (e) {
    alert('Saving failed.');
  }
});
