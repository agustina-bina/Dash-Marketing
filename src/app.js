/**
 * App.js - Lógica principal de la aplicación
 */

const ADMIN_PASSWORD = '45418972Lc';

export class App {
  constructor() {
    this.empresaButtons = null;
    this.adminButton = null;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.empresaButtons = document.querySelectorAll('.empresa-btn');
    this.adminButton = document.getElementById('adminBtn');

    this.setupEventListeners();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Event listeners para botones de empresa
    this.empresaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const empresa = e.currentTarget.dataset.empresa;
        this.selectEmpresa(empresa);
      });
    });

    // Event listener para botón de administrador
    if (this.adminButton) {
      this.adminButton.addEventListener('click', () => {
        this.handleAdminLogin();
      });
    }
  }

  /**
   * Selecciona una empresa y redirige al dashboard
   * @param {string} empresa - Nombre de la empresa seleccionada
   */
  selectEmpresa(empresa) {
    // Guardar empresa seleccionada en localStorage
    localStorage.setItem('empresaSeleccionada', empresa);
    localStorage.setItem('modoAdmin', 'false');

    // Redirigir al dashboard
    this.redirectToDashboard();
  }

  /**
   * Maneja el login de administrador
   */
  handleAdminLogin() {
    const password = prompt('Ingrese la contraseña de administrador:');

    if (password === null) {
      // Usuario canceló el prompt
      return;
    }

    if (password === ADMIN_PASSWORD) {
      // Contraseña correcta
      localStorage.setItem('empresaSeleccionada', 'Administrador');
      localStorage.setItem('modoAdmin', 'true');
      this.redirectToDashboard();
    } else {
      // Contraseña incorrecta
      alert('Contraseña incorrecta');
    }
  }

  /**
   * Redirige al dashboard
   */
  redirectToDashboard() {
    window.location.href = './src/pages/dashboard.html';
  }
}

/**
 * Funciones utilitarias para usar en otras páginas
 */
export function getEmpresaSeleccionada() {
  return localStorage.getItem('empresaSeleccionada');
}

export function isModoAdmin() {
  return localStorage.getItem('modoAdmin') === 'true';
}

export function logout() {
  localStorage.removeItem('empresaSeleccionada');
  localStorage.removeItem('modoAdmin');
  window.location.href = '../../index.html';
}
