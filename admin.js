import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, collection, onSnapshot, orderBy, query } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const config = window.firebaseConfig;
const auth = getAuth(initializeApp(config));
const db = getFirestore();
const adminEmails = ['alvaro.villa.cotarra@gmail.com'];
const formatDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
document.querySelector('#today').textContent = formatDate.format(new Date());
onAuthStateChanged(auth, user => {
  if (!user || !adminEmails.includes(user.email)) { if (user) signOut(auth); window.location.replace('index.html'); return; }
  const name = user.email?.split('@')[0] || 'Administrador';
  const initial = name.charAt(0).toUpperCase();
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#profile-name').textContent = name;
  document.querySelector('#avatar').textContent = initial;
  document.querySelector('#profile-avatar').textContent = initial;
  subscribeToLeads();
});
document.querySelector('#logout').addEventListener('click', async () => { await signOut(auth); window.location.replace('index.html'); });
document.querySelector('#copy-url').addEventListener('click', async event => { await navigator.clipboard.writeText(window.location.origin + window.location.pathname.replace('admin.html', '')); event.currentTarget.innerHTML = 'Enlace copiado <b>✓</b>'; });

let unsubscribeLeads;
function subscribeToLeads() {
  if (unsubscribeLeads) return;
  const table = document.querySelector('#leads-table');
  const empty = document.querySelector('#empty-leads');
  const wrapper = document.querySelector('#leads-table-wrap');
  const count = document.querySelector('#lead-count');
  const received = lead => lead.creadaEn?.toDate ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(lead.creadaEn.toDate()) : 'Ahora';
  unsubscribeLeads = onSnapshot(query(collection(db, 'solicitudes'), orderBy('creadaEn', 'desc')), snapshot => {
    count.textContent = `${snapshot.size} ${snapshot.size === 1 ? 'solicitud' : 'solicitudes'}`;
    empty.hidden = snapshot.size > 0;
    wrapper.hidden = snapshot.empty;
    table.innerHTML = snapshot.docs.map(doc => {
      const lead = doc.data();
      return `<tr><td><strong>${escapeHtml(lead.nombre)}</strong><span>${escapeHtml(lead.email)}</span></td><td>${escapeHtml(lead.negocio)}</td><td><span class="lead-status">${escapeHtml(lead.necesidad || 'Nueva')}</span></td><td><strong>${escapeHtml(lead.telefono || '—')}</strong><span>${escapeHtml(lead.tipo || '')}</span></td><td>${received(lead)}</td></tr>`;
    }).join('');
  }, error => {
    console.error('Error al leer solicitudes:', error);
    empty.querySelector('h3').textContent = 'No se pueden cargar las solicitudes.';
    empty.querySelector('p').textContent = 'Revisa que Firestore esté creado y las reglas de seguridad se hayan publicado.';
  });
}
function escapeHtml(value = '') { const node = document.createElement('div'); node.textContent = String(value); return node.innerHTML; }
