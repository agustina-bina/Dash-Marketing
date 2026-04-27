/**
 * Sidebar Component
 * Renderiza la barra lateral de navegación
 */

import { getEmpresaSeleccionada, isModoAdmin, logout } from '../app.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D', href: './dashboard.html' },
  { id: 'calendario', label: 'Calendario', icon: 'C', href: './calendario.html' },
  { id: 'metricas', label: 'Metricas', icon: 'M', href: './metricas.html' },
  { id: 'ideas', label: 'Ideas', icon: 'I', href: './ideas.html' },
  { id: 'productos', label: 'Productos', icon: 'P', href: './productos.html' },
  { id: 'glosario', label: 'Glosario', icon: 'G', href: './glosario.html' },
];

/**
 * Renderiza el sidebar en el elemento con id="sidebar"
 * @param {string} activePage - ID de la pagina activa
 */
export function renderSidebar(activePage = '') {
  const sidebarElement = document.getElementById('sidebar');
  if (!sidebarElement) return;

  const empresa = getEmpresaSeleccionada() || 'Sin seleccionar';
  const isAdmin = isModoAdmin();

  const navItemsHTML = navItems.map(item => `
    <li class="nav-item">
      <a href="${item.href}" class="nav-link ${item.id === activePage ? 'active' : ''}">
        <span class="nav-icon-letter">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  sidebarElement.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">GTC Marketing</div>
      <div class="sidebar-empresa">${escapeHtml(empresa)}${isAdmin ? ' (Admin)' : ''}</div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        ${navItemsHTML}
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <button class="logout-btn" id="logoutBtn">
        <span class="logout-icon">X</span>
        <span>Cerrar sesion</span>
      </button>
    </div>
  `;

  // Event listener para logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
