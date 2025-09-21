// Example when backend is ready:
const BASE_URL = 'https://api.example.com/v1'; // backend provides

async function getJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Example usage to replace mocks later:
// const { floats } = await getJson(`${BASE_URL}/floats?bbox=8,60,24,78&date=2024-01-01,2024-12-31&param=temp`);
// const prof = await getJson(`${BASE_URL}/profile?float_id=${floats[0].id}&date=2024-01-01&param=temp`);
// renderMarkers(floats);
// renderProfile({ x: prof.series.x, y: prof.series.y, name: 'Temp (°C)' });
// renderBrief(computeBrief(floats, { x: prof.series.x, y: prof.series.y }));
