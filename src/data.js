/**
 * Data.js - Gestion de datos con localStorage por empresa
 * Optimizado para evitar NaN, undefined y errores
 */

const EMPRESAS = ['GTC Shop', 'GTC Ribbon', 'GTC Chile'];

/**
 * Obtiene la clave de localStorage para una empresa
 */
function getStorageKey(empresa, tipo) {
  if (!empresa || typeof empresa !== 'string') return null;
  const empresaKey = empresa.replace(/\s+/g, '_').toLowerCase();
  return `gtc_marketing_${empresaKey}_${tipo}`;
}

/**
 * Obtiene datos de una empresa con manejo de errores
 */
export function getData(empresa, tipo) {
  try {
    const key = getStorageKey(empresa, tipo);
    if (!key) return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al leer datos:', error);
    return null;
  }
}

/**
 * Guarda datos de una empresa con manejo de errores
 */
export function setData(empresa, tipo, data) {
  try {
    const key = getStorageKey(empresa, tipo);
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al guardar datos:', error);
    return false;
  }
}

/**
 * Obtiene todos los datos de todas las empresas (para admin)
 */
export function getAllData(tipo) {
  const allData = {};
  EMPRESAS.forEach(empresa => {
    allData[empresa] = getData(empresa, tipo) || [];
  });
  return allData;
}

// ============ CONTENIDO ============

/**
 * Obtiene contenidos del calendario
 */
export function getContenidos(empresa) {
  if (!empresa || empresa === 'Administrador') {
    // Admin ve todos los contenidos
    const all = [];
    EMPRESAS.forEach(emp => {
      const contenidos = getData(emp, 'contenidos') || [];
      contenidos.forEach(c => {
        all.push({ ...c, empresa: emp });
      });
    });
    return all;
  }
  return getData(empresa, 'contenidos') || [];
}

/**
 * Guarda un contenido nuevo con validacion
 */
export function saveContenido(empresa, contenido) {
  if (!empresa || empresa === 'Administrador') {
    console.error('No se puede guardar sin empresa seleccionada');
    return null;
  }
  
  const contenidos = getContenidos(empresa);
  
  // Validar datos obligatorios
  if (!contenido.fecha || !contenido.formato || !contenido.canal) {
    console.error('Faltan campos obligatorios');
    return null;
  }
  
  contenido.id = Date.now();
  contenido.createdAt = new Date().toISOString();
  
  // Asegurar valores numericos validos
  contenido.alcance = sanitizeNumber(contenido.alcance);
  contenido.likes = sanitizeNumber(contenido.likes);
  contenido.comentarios = sanitizeNumber(contenido.comentarios);
  contenido.guardados = sanitizeNumber(contenido.guardados);
  contenido.compartidos = sanitizeNumber(contenido.compartidos);
  contenido.visualizaciones = sanitizeNumber(contenido.visualizaciones);
  
  contenidos.push(contenido);
  setData(empresa, 'contenidos', contenidos);
  return contenido;
}

/**
 * Actualiza un contenido existente
 */
export function updateContenido(empresa, id, updates) {
  if (!empresa || empresa === 'Administrador') return null;
  
  const contenidos = getContenidos(empresa);
  const index = contenidos.findIndex(c => c.id === id);
  
  if (index !== -1) {
    // Sanitizar valores numericos
    if (updates.alcance !== undefined) updates.alcance = sanitizeNumber(updates.alcance);
    if (updates.likes !== undefined) updates.likes = sanitizeNumber(updates.likes);
    if (updates.comentarios !== undefined) updates.comentarios = sanitizeNumber(updates.comentarios);
    if (updates.guardados !== undefined) updates.guardados = sanitizeNumber(updates.guardados);
    if (updates.compartidos !== undefined) updates.compartidos = sanitizeNumber(updates.compartidos);
    if (updates.visualizaciones !== undefined) updates.visualizaciones = sanitizeNumber(updates.visualizaciones);
    
    contenidos[index] = { 
      ...contenidos[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    setData(empresa, 'contenidos', contenidos);
    return contenidos[index];
  }
  return null;
}

/**
 * Elimina un contenido
 */
export function deleteContenido(empresa, id) {
  if (!empresa || empresa === 'Administrador') return false;
  
  const contenidos = getContenidos(empresa);
  const filtered = contenidos.filter(c => c.id !== id);
  return setData(empresa, 'contenidos', filtered);
}

// ============ IDEAS ============

/**
 * Obtiene ideas
 */
export function getIdeas(empresa) {
  if (!empresa || empresa === 'Administrador') {
    const all = [];
    EMPRESAS.forEach(emp => {
      const ideas = getData(emp, 'ideas') || [];
      ideas.forEach(i => all.push({ ...i, empresa: emp }));
    });
    return all;
  }
  return getData(empresa, 'ideas') || [];
}

/**
 * Guarda una idea nueva con validacion
 */
export function saveIdea(empresa, idea) {
  if (!empresa || empresa === 'Administrador') return null;
  
  if (!idea.title || idea.title.trim() === '') {
    console.error('El titulo es obligatorio');
    return null;
  }
  
  const ideas = getIdeas(empresa);
  idea.id = Date.now();
  idea.createdAt = new Date().toISOString();
  idea.title = idea.title.trim();
  idea.description = (idea.description || '').trim();
  idea.tags = Array.isArray(idea.tags) ? idea.tags.filter(t => t && t.trim()) : [];
  
  ideas.push(idea);
  setData(empresa, 'ideas', ideas);
  return idea;
}

/**
 * Elimina una idea
 */
export function deleteIdea(empresa, id) {
  if (!empresa || empresa === 'Administrador') return false;
  
  const ideas = getIdeas(empresa);
  const filtered = ideas.filter(i => i.id !== id);
  return setData(empresa, 'ideas', filtered);
}

// ============ PRODUCTOS ============

/**
 * Obtiene productos
 */
export function getProductos(empresa) {
  if (!empresa || empresa === 'Administrador') {
    const all = [];
    EMPRESAS.forEach(emp => {
      const productos = getData(emp, 'productos') || [];
      productos.forEach(p => all.push({ ...p, empresa: emp }));
    });
    return all;
  }
  return getData(empresa, 'productos') || [];
}

/**
 * Guarda un producto nuevo con validacion
 */
export function saveProducto(empresa, producto) {
  if (!empresa || empresa === 'Administrador') return null;
  
  if (!producto.name || producto.name.trim() === '') {
    console.error('El nombre es obligatorio');
    return null;
  }
  
  const productos = getProductos(empresa);
  
  // Verificar duplicados por SKU
  if (producto.sku && producto.sku.trim()) {
    const existente = productos.find(p => p.sku === producto.sku.trim());
    if (existente) {
      console.warn('Ya existe un producto con ese SKU');
      // Actualizar en lugar de duplicar
      return updateProducto(empresa, existente.id, producto);
    }
  }
  
  producto.id = Date.now();
  producto.createdAt = new Date().toISOString();
  producto.name = producto.name.trim();
  producto.sku = (producto.sku || '').trim();
  producto.price = sanitizeNumber(producto.price);
  producto.tags = Array.isArray(producto.tags) ? producto.tags.filter(t => t && t.trim()) : [];
  
  productos.push(producto);
  setData(empresa, 'productos', productos);
  return producto;
}

/**
 * Actualiza un producto existente
 */
export function updateProducto(empresa, id, updates) {
  if (!empresa || empresa === 'Administrador') return null;
  
  const productos = getProductos(empresa);
  const index = productos.findIndex(p => p.id === id);
  
  if (index !== -1) {
    if (updates.price !== undefined) updates.price = sanitizeNumber(updates.price);
    productos[index] = { 
      ...productos[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    setData(empresa, 'productos', productos);
    return productos[index];
  }
  return null;
}

/**
 * Elimina un producto (solo admin)
 */
export function deleteProducto(empresa, id) {
  if (!empresa || empresa === 'Administrador') return false;
  
  const productos = getProductos(empresa);
  const filtered = productos.filter(p => p.id !== id);
  return setData(empresa, 'productos', filtered);
}

// ============ GLOSARIO ============

/**
 * Obtiene terminos del glosario
 */
export function getGlosario(empresa) {
  const data = getData(empresa, 'glosario');
  return data && data.length > 0 ? data : getDefaultGlosario();
}

/**
 * Glosario predefinido
 */
function getDefaultGlosario() {
  return [
    { id: 1, termino: 'CTA', definicion: 'Call To Action - Llamada a la accion que invita al usuario a realizar una accion especifica.', categoria: 'Marketing' },
    { id: 2, termino: 'Engagement', definicion: 'Nivel de interaccion y compromiso de la audiencia con el contenido.', categoria: 'Metricas' },
    { id: 3, termino: 'Alcance', definicion: 'Numero de personas unicas que han visto el contenido.', categoria: 'Metricas' },
    { id: 4, termino: 'Hook', definicion: 'Gancho inicial que captura la atencion del usuario en los primeros segundos.', categoria: 'Contenido' },
    { id: 5, termino: 'Pilar de contenido', definicion: 'Tema principal o categoria que define la estrategia de contenido.', categoria: 'Estrategia' },
    { id: 6, termino: 'Copy', definicion: 'Texto persuasivo utilizado en publicidad y marketing.', categoria: 'Contenido' },
    { id: 7, termino: 'Impresiones', definicion: 'Numero total de veces que se mostro el contenido.', categoria: 'Metricas' },
    { id: 8, termino: 'ROI', definicion: 'Return On Investment - Retorno de la inversion.', categoria: 'Finanzas' },
    { id: 9, termino: 'KPI', definicion: 'Key Performance Indicator - Indicador clave de rendimiento.', categoria: 'Metricas' },
    { id: 10, termino: 'Lead', definicion: 'Contacto potencial que ha mostrado interes en el producto o servicio.', categoria: 'Marketing' },
  ];
}

/**
 * Guarda un termino nuevo
 */
export function saveTermino(empresa, termino) {
  if (!empresa) return null;
  
  if (!termino.termino || !termino.definicion) {
    console.error('Termino y definicion son obligatorios');
    return null;
  }
  
  const glosario = getGlosario(empresa);
  termino.id = Date.now();
  termino.termino = termino.termino.trim();
  termino.definicion = termino.definicion.trim();
  termino.categoria = termino.categoria || 'Otro';
  
  glosario.push(termino);
  setData(empresa, 'glosario', glosario);
  return termino;
}

// ============ METRICAS ============

/**
 * Sanitiza un numero para evitar NaN
 */
function sanitizeNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) ? 0 : Math.max(0, num);
}

/**
 * Calcula el engagement de un contenido
 * engagement = (likes + comentarios*2 + guardados*3 + compartidos*4) / alcance * 100
 */
export function calcularEngagement(contenido) {
  if (!contenido) return 0;
  
  const alcance = sanitizeNumber(contenido.alcance);
  const likes = sanitizeNumber(contenido.likes);
  const comentarios = sanitizeNumber(contenido.comentarios);
  const guardados = sanitizeNumber(contenido.guardados);
  const compartidos = sanitizeNumber(contenido.compartidos);
  
  // Evitar division por cero
  if (alcance === 0) return 0;
  
  const engagement = ((likes + comentarios * 2 + guardados * 3 + compartidos * 4) / alcance) * 100;
  return Math.round(engagement * 100) / 100;
}

/**
 * Obtiene metricas generales de una empresa
 */
export function getMetricas(empresa) {
  const contenidos = getContenidos(empresa);
  
  const totalAlcance = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.alcance), 0);
  const totalLikes = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.likes), 0);
  const totalComentarios = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.comentarios), 0);
  const totalGuardados = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.guardados), 0);
  const totalCompartidos = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.compartidos), 0);
  const totalVisualizaciones = contenidos.reduce((sum, c) => sum + sanitizeNumber(c.visualizaciones), 0);
  
  const engagements = contenidos
    .map(c => calcularEngagement(c))
    .filter(e => e > 0);
  
  const promedioEngagement = engagements.length > 0 
    ? Math.round((engagements.reduce((a, b) => a + b, 0) / engagements.length) * 100) / 100 
    : 0;

  const publicados = contenidos.filter(c => c.estado === 'publicado').length;
  const pendientes = contenidos.filter(c => c.estado === 'pendiente' || c.estado === 'borrador').length;
  const programados = contenidos.filter(c => c.estado === 'programado').length;

  return {
    totalContenidos: contenidos.length,
    publicados,
    pendientes,
    programados,
    totalAlcance,
    totalLikes,
    totalComentarios,
    totalGuardados,
    totalCompartidos,
    totalVisualizaciones,
    promedioEngagement,
    totalInteracciones: totalLikes + totalComentarios + totalGuardados + totalCompartidos
  };
}

/**
 * Obtiene metricas semanales
 */
export function getMetricasSemanales(empresa) {
  const contenidos = getContenidos(empresa);
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - 7);
  inicioSemana.setHours(0, 0, 0, 0);

  const contenidosSemana = contenidos.filter(c => {
    if (!c.fecha) return false;
    const fecha = new Date(c.fecha);
    return fecha >= inicioSemana && fecha <= hoy;
  });

  const engagements = contenidosSemana
    .map(c => calcularEngagement(c))
    .filter(e => e > 0);
    
  return engagements.length > 0 
    ? Math.round((engagements.reduce((a, b) => a + b, 0) / engagements.length) * 100) / 100 
    : 0;
}

/**
 * Obtiene metricas mensuales
 */
export function getMetricasMensuales(empresa) {
  const contenidos = getContenidos(empresa);
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const contenidosMes = contenidos.filter(c => {
    if (!c.fecha) return false;
    const fecha = new Date(c.fecha);
    return fecha >= inicioMes && fecha <= hoy;
  });

  const engagements = contenidosMes
    .map(c => calcularEngagement(c))
    .filter(e => e > 0);
    
  return engagements.length > 0 
    ? Math.round((engagements.reduce((a, b) => a + b, 0) / engagements.length) * 100) / 100 
    : 0;
}

/**
 * Determina el color de rendimiento
 */
export function getRendimientoColor(engagement) {
  const eng = sanitizeNumber(engagement);
  if (eng >= 5) return 'verde';
  if (eng >= 2) return 'amarillo';
  return 'rojo';
}

// ============ OBJETIVOS ============

/**
 * Obtiene objetivos del mes
 */
export function getObjetivos(empresa) {
  const data = getData(empresa, 'objetivos');
  return data || {
    contenidosMes: 20,
    alcanceMes: 50000,
    engagementMeta: 5
  };
}

/**
 * Guarda objetivos
 */
export function setObjetivos(empresa, objetivos) {
  if (!empresa) return false;
  
  objetivos.contenidosMes = sanitizeNumber(objetivos.contenidosMes) || 20;
  objetivos.alcanceMes = sanitizeNumber(objetivos.alcanceMes) || 50000;
  objetivos.engagementMeta = sanitizeNumber(objetivos.engagementMeta) || 5;
  
  return setData(empresa, 'objetivos', objetivos);
}
