import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

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
let currentFilter = 'pendiente';
let leads = [];
function subscribeToLeads() {
  if (unsubscribeLeads) return;
  const table = document.querySelector('#leads-table');
  const empty = document.querySelector('#empty-leads');
  const wrapper = document.querySelector('#leads-table-wrap');
  const count = document.querySelector('#lead-count');
  unsubscribeLeads = onSnapshot(query(collection(db, 'solicitudes'), orderBy('creadaEn', 'desc')), snapshot => {
    leads = snapshot.docs.map(snapshotDoc => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
    renderLeads();
  }, error => {
    console.error('Error al leer solicitudes:', error);
    empty.querySelector('h3').textContent = 'No se pueden cargar las solicitudes.';
    empty.querySelector('p').textContent = 'Revisa que Firestore esté creado y las reglas de seguridad se hayan publicado.';
  });
}
function escapeHtml(value = '') { const node = document.createElement('div'); node.textContent = String(value); return node.innerHTML; }
function normaliseStatus(lead) { return lead.estado === 'nueva' ? 'pendiente' : (lead.estado || 'pendiente'); }
function received(lead) { return lead.creadaEn?.toDate ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(lead.creadaEn.toDate()) : 'Ahora'; }
function renderLeads() {
  const table = document.querySelector('#leads-table');
  const empty = document.querySelector('#empty-leads');
  const wrapper = document.querySelector('#leads-table-wrap');
  const count = document.querySelector('#lead-count');
  const heading = document.querySelector('#leads-heading');
  const names = { pendiente: 'Solicitudes pendientes', vista: 'Solicitudes vistas', papelera: 'Papelera' };
  const counts = { pendiente: 0, vista: 0, papelera: 0 };
  leads.forEach(lead => { counts[normaliseStatus(lead)] = (counts[normaliseStatus(lead)] || 0) + 1; });
  document.querySelector('#pending-count').textContent = counts.pendiente;
  document.querySelector('#seen-count').textContent = counts.vista;
  document.querySelector('#trash-count').textContent = counts.papelera;
  document.querySelector('#pending-nav-count').textContent = counts.pendiente;
  document.querySelector('#seen-nav-count').textContent = counts.vista;
  document.querySelector('#trash-nav-count').textContent = counts.papelera;
  heading.textContent = names[currentFilter];
  const visible = leads.filter(lead => normaliseStatus(lead) === currentFilter);
  count.textContent = `${visible.length} ${visible.length === 1 ? 'solicitud' : 'solicitudes'}`;
  empty.hidden = visible.length > 0;
  wrapper.hidden = visible.length === 0;
  empty.querySelector('h3').textContent = currentFilter === 'papelera' ? 'La papelera está vacía.' : `Aún no hay solicitudes ${currentFilter === 'vista' ? 'vistas' : 'pendientes'}.`;
  empty.querySelector('p').textContent = currentFilter === 'papelera' ? 'Las solicitudes eliminadas se guardan aquí hasta que decidas borrarlas definitivamente.' : 'Las solicitudes que se envíen desde la web aparecerán aquí en tiempo real.';
  table.innerHTML = visible.map(lead => `<tr><td><strong>${escapeHtml(lead.nombre)}</strong><span>${escapeHtml(lead.email)}</span></td><td>${escapeHtml(lead.negocio)}</td><td><span class="lead-status">${escapeHtml(lead.necesidad || 'Nueva')}</span></td><td><strong>${escapeHtml(lead.telefono || '—')}</strong><span>${escapeHtml(lead.tipo || '')}</span></td><td>${received(lead)}</td><td>${actionsFor(lead)}</td></tr>`).join('');
}
function actionsFor(lead) {
  if (currentFilter === 'papelera') return `<div class="lead-actions"><button data-action="restore" data-id="${lead.id}">Restaurar</button><button class="danger" data-action="delete" data-id="${lead.id}">Borrar</button></div>`;
  if (currentFilter === 'vista') return `<div class="lead-actions"><button data-action="pending" data-id="${lead.id}">Pendiente</button><button class="danger" data-action="trash" data-id="${lead.id}">Eliminar</button></div>`;
  return `<div class="lead-actions"><button data-action="seen" data-id="${lead.id}">Marcar vista</button><button class="danger" data-action="trash" data-id="${lead.id}">Eliminar</button></div>`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { currentFilter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button)); renderLeads(); }));
document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => document.querySelector(`[data-filter="${link.dataset.filterLink}"]`).click()));
document.querySelector('#leads-table').addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const leadId = button.dataset.id;
  const action = button.dataset.action;
  button.disabled = true;
  try {
    if (action === 'delete') await deleteDoc(doc(db, 'solicitudes', leadId));
    else await updateDoc(doc(db, 'solicitudes', leadId), { estado: action === 'seen' ? 'vista' : action === 'pending' || action === 'restore' ? 'pendiente' : 'papelera' });
  } catch (error) { console.error('Error al actualizar la solicitud:', error); button.disabled = false; }
});
