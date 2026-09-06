import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const app = getApps().length ? getApps()[0] : initializeApp(window.firebaseConfig);
const db = getFirestore(app);
const form = document.querySelector('#quote-form');
const message = form.querySelector('.form-message');
const submit = form.querySelector('[type="submit"]');
const withTimeout = (promise, milliseconds = 12000) => Promise.race([
  promise,
  new Promise((_, reject) => window.setTimeout(() => reject(new Error('request-timeout')), milliseconds))
]);

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  submit.disabled = true;
  message.textContent = 'Enviando tu solicitud…';
  try {
    await withTimeout(addDoc(collection(db, 'solicitudes'), {
      nombre: data.get('nombre').trim(),
      negocio: data.get('negocio').trim(),
      email: data.get('email').trim().toLowerCase(),
      telefono: data.get('telefono').trim(),
      tipo: data.get('tipo'),
      necesidad: data.get('necesidad'),
      mensaje: data.get('mensaje').trim(),
      estado: 'nueva',
      creadaEn: serverTimestamp()
    }));
    form.reset();
    message.textContent = 'Gracias. Hemos recibido tu solicitud y te responderemos muy pronto.';
  } catch (error) {
    console.error('Error al guardar la solicitud:', error);
    if (error.message === 'request-timeout') {
      message.textContent = 'El servicio tarda demasiado en responder. Prueba de nuevo en unos minutos o escríbenos a hola@webhook.studio.';
    } else if (error.code === 'permission-denied') {
      message.textContent = 'El formulario no está autorizado todavía. Ya hemos registrado el aviso para corregirlo.';
    } else {
      message.textContent = 'No hemos podido enviar la solicitud. Prueba de nuevo o escríbenos a hola@webhook.studio.';
    }
  } finally {
    submit.disabled = false;
  }
});
