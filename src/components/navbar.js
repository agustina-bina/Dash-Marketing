/**
 * Navbar Component
 * Renderiza la barra de navegacion superior
 */

import { isModoAdmin } from '../app.js';

/**
 * Renderiza el navbar en el elemento con id="navbar"
 * @param {string} pageTitle - Titulo de la pagina actual
 */
export function renderNavbar(pageTitle = 'Dashboard') {
  const navbarElement = document.getElementById('navbar');
  if (!navbarElement) return;

  const isAdmin = isModoAdmin();

  navbarElement.innerHTML = `
    <h1 class="page-title">${escapeHtml(pageTitle)}</h1>
    ${isAdmin ? '<span class="admin-badge">Modo Admin</span>' : ''}
  `;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
