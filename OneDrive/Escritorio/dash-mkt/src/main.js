/**
 * Main.js - Entry point de la aplicación
 * Maneja la selección de empresa y autenticación de administrador
 */

import { App } from './app.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
