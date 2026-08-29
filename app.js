const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => { const isOpen = header.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', isOpen); document.body.style.overflow = isOpen ? 'hidden' : ''; });
document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(item => reveal.observe(item));
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', event => { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; });
document.querySelector('#quote-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; form.querySelector('.form-message').textContent = 'Gracias. Hemos recibido tu solicitud y nos pondremos en contacto contigo muy pronto.'; form.reset(); });
