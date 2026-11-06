let alertId;
let recorder, chunks = [];

const send = (url, method, body) =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

//SOS thing
document.getElementById('sos').onclick = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };

    const res = await send('/api/alerts', 'POST', {
      userName: 'Demo User',
      contacts: ['9999999999'],
      location
    });
    alertId = (await res.json()).id;

    //keep sending location as the user moves
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
  }, () => alert('Please allow location access'));
};

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
}