import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const isConfigured = config => config && !Object.values(config).some(value => String(value).startsWith('REEMPLAZA_'));

if (isConfigured(window.firebaseConfig)) {
  const app = initializeApp(window.firebaseConfig);
  const auth = getAuth(app);
  window.webhookSignIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
} else {
  window.webhookSignIn = () => Promise.reject(new Error('firebase-not-configured'));
}
