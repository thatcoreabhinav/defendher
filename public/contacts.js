function getContacts() {
  try { return JSON.parse(localStorage.getItem('contacts')) || []; }
  catch { return []; }
}

function saveContacts(list) {
  localStorage.setItem('contacts', JSON.stringify(list));
}

function renderContacts() {
  const box = document.getElementById('clist');
  const list = getContacts();
  box.innerHTML = list.length ? '' : '<p>No contacts yet</p>';

  list.forEach((c, i) => {
    const row = document.createElement('div');
    row.style.margin = '6px';
    row.textContent = `👤 ${c.name} · ${c.phone} `;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => { list.splice(i, 1); saveContacts(list); renderContacts(); };
    row.appendChild(del);
    box.appendChild(row);
  });
}

document.getElementById('addc').onclick = () => {
  const name = document.getElementById('cname').value.trim();
  const phone = document.getElementById('cphone').value.trim();
  const list = getContacts();

  if (!name) return alert('Enter a name');
  if (!/^\d{10}$/.test(phone)) return alert('Enter a 10-digit phone number');
  if (list.length >= 3) return alert('Maximum 3 contacts');

  list.push({ name, phone });
  saveContacts(list);
  document.getElementById('cname').value = '';
  document.getElementById('cphone').value = '';
  renderContacts();
};

renderContacts();