const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => { const isOpen = header.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', isOpen); document.body.style.overflow = isOpen ? 'hidden' : ''; });
document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => reveal.observe(item));
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', event => { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; });
document.querySelector('#quote-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; form.querySelector('.form-message').textContent = 'Gracias. Hemos recibido tu solicitud y nos pondremos en contacto contigo muy pronto.'; form.reset(); });
const teamModal = document.querySelector('#team-modal');
const openTeamModal = () => { teamModal.hidden = false; document.body.style.overflow = 'hidden'; teamModal.querySelector('input').focus(); };
const closeTeamModal = () => { teamModal.hidden = true; document.body.style.overflow = ''; };
teamModal.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeTeamModal));
let accessSequence = '';
let accessTimeout;
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !teamModal.hidden) { closeTeamModal(); return; }
  if (event.target.matches('input, textarea, select')) return;
  if (event.key.length !== 1) return;
  accessSequence = `${accessSequence}${event.key.toLowerCase()}`.slice(-7);
  clearTimeout(accessTimeout);
  accessTimeout = setTimeout(() => { accessSequence = ''; }, 1800);
  if (accessSequence === 'webhook' && teamModal.hidden) { openTeamModal(); accessSequence = ''; }
});
document.querySelector('#team-form').addEventListener('submit', event => { event.preventDefault(); event.currentTarget.querySelector('.team-message').textContent = 'Acceso pendiente de configurar. Conecta este formulario a tu sistema de administración.'; });
