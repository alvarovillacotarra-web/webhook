import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const config = window.firebaseConfig;
const auth = getAuth(initializeApp(config));
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
});
document.querySelector('#logout').addEventListener('click', async () => { await signOut(auth); window.location.replace('index.html'); });
document.querySelector('#copy-url').addEventListener('click', async event => { await navigator.clipboard.writeText(window.location.origin + window.location.pathname.replace('admin.html', '')); event.currentTarget.innerHTML = 'Enlace copiado <b>✓</b>'; });
