let alertId;
let recorder, chunks = [];

const send = (url, method, body) =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// ---------- SOS ----------
document.getElementById('sos').onclick = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };

    const res = await send('/api/alerts', 'POST', {
      userName: 'Demo User',
      contacts: ['9999999999'],
      location
    });
    alertId = (await res.json()).id;

    navigator.geolocation.watchPosition((p) => {
      send(`/api/alerts/${alertId}/location`, 'PATCH', {
        lat: p.coords.latitude,
        lng: p.coords.longitude
      });
    });

    const link = `${window.location.origin}/track.html?id=${alertId}`;
    document.getElementById('status').innerHTML =
      `🚨 SOS active. Share this link with your contacts:<br><a href="${link}" target="_blank">${link}</a>`;

    startRecording();
    notifyPolice(location);
  }, () => alert('Please allow location access'));
};

// ---------- Recording ----------
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const preview = document.getElementById('preview');
    preview.srcObject = stream;
    preview.style.display = 'block';
    document.getElementById('rec-label').style.display = 'block';
    document.getElementById('stop').style.display = 'inline-block';

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      preview.style.display = 'none';
      document.getElementById('rec-label').style.display = 'none';
      document.getElementById('stop').style.display = 'none';
      document.getElementById('rec-actions').style.display = 'block';
    };
    recorder.start();
  } catch (e) {
    alert('Camera/mic permission needed for recording');
  }
}

document.getElementById('stop').onclick = () => recorder.stop();

document.getElementById('send').onclick = async () => {
  const form = new FormData();
  form.append('video', new Blob(chunks, { type: 'video/webm' }));
  await fetch('/api/recordings/' + alertId, { method: 'POST', body: form });
  chunks = [];
  document.getElementById('rec-actions').style.display = 'none';
  alert('Recording sent to authorities');
};

document.getElementById('erase').onclick = () => {
  chunks = [];
  document.getElementById('rec-actions').style.display = 'none';
  alert('Recording erased');
};

// ---------- Nearest police station ----------
function distKm(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];

async function notifyPolice(loc) {
  const box = document.getElementById('police');
  box.textContent = 'Locating nearest police station...';

  const q = `[out:json][timeout:25];nwr["amenity"="police"](around:5000,${loc.lat},${loc.lng});out center 20;`;
  let data = null;

  for (const url of OVERPASS) {
    try {
      const res = await fetch(url + '?data=' + encodeURIComponent(q));
      if (!res.ok) { console.log('Overpass', url, res.status); continue; }
      data = await res.json();
      break;
    } catch (e) {
      console.log('Overpass failed', url, e);
    }
  }

  if (!data) {
    box.textContent = '🚔 Could not locate a station. Please call 112.';
    return;
  }

  const stations = data.elements
    .map(e => ({
      name: (e.tags && e.tags.name) || 'Police Station',
      lat: e.lat ?? (e.center && e.center.lat),
      lng: e.lon ?? (e.center && e.center.lon)
    }))
    .filter(s => s.lat !== undefined)
    .map(s => ({ ...s, km: distKm(loc, s) }))
    .sort((a, b) => a.km - b.km);

  if (!stations.length) {
    box.textContent = '🚔 No police station found within 5 km. Please call 112.';
    return;
  }
  const s = stations[0];
  box.innerHTML = `🚔 Alert sent to <b>${s.name}</b> (${s.km.toFixed(1)} km away)`;
}

// ---------- Vehicle check ----------
document.getElementById('check').onclick = async () => {
  const num = document.getElementById('vnum').value.trim();
  if (!num) return;
  const out = document.getElementById('vresult');
  const res = await fetch('/api/vehicles/' + encodeURIComponent(num));

  if (res.ok) {
    const v = await res.json();
    out.innerHTML = `<div style="background:#2e7d32; padding:15px; border-radius:10px; display:inline-block;">
      ✅ Registered ${v.type}<br>Driver: ${v.driverName}<br>Phone: ${v.phone}<br>License: ${v.licenseNo}</div>`;
  } else {
    out.innerHTML = `<div style="background:#c62828; padding:15px; border-radius:10px; display:inline-block;">
      ⚠️ Unregistered vehicle. Avoid it and be careful.</div>`;
  }
};