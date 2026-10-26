// URL de la API creada en JsonBlob con los datos suministrados
const API_URL = 'https://jsonblob.com/01a1779f-dcf4-7bd0-bd82-a8bce706f47a/json';

// Fallback con el JSON original en caso de caída del servicio de pruebas
const FALLBACK_DATA = {
  "currency": "€",
  "products": [
    { "SKU": "0K3QOSOV4V", "title": "iPhone 13 Pro", "price": "938.99" },
    { "SKU": "TGD5XORY1L", "title": "Cargador", "price": "49.99" },
    { "SKU": "IOKW9BQ9F3", "title": "Funda de piel", "price": "79.99" }
  ]
};

let carritoInstancia = null;

document.addEventListener('DOMContentLoaded', () => {
  iniciarApp();
});

async function iniciarApp() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al conectar con la API');
    const data = await res.json();
    inicializarCarrito(data);
  } catch (err) {
    console.warn('API no disponible o error de CORS. Cargando datos de respaldo...', err);
    inicializarCarrito(FALLBACK_DATA);
  }
}

function inicializarCarrito(data) {
  carritoInstancia = new Carrito(data.products, data.currency);
  renderizarProductos(data.products, data.currency);
  actualizarVistaCarrito();
}

/**
 * Genera dinámicamente las filas de productos en el DOM
 */
function renderizarProductos(productos, currency) {
  const container = document.getElementById('products-list');
  container.innerHTML = '';

  productos.forEach(prod => {
    const sku = prod.SKU || prod.sku;
    const row = document.createElement('div');
    row.className = 'product-row';
    row.id = `row-${sku}`;

    row.innerHTML = `
      <div class="prod-info">
        <div class="prod-title">${prod.title}</div>
        <div class="prod-sku">REF: ${sku}</div>
      </div>
      <div class="prod-quantity">
        <button type="button" class="qty-btn btn-minus" data-sku="${sku}">-</button>
        <input type="number" min="0" value="0" class="qty-input" data-sku="${sku}" id="input-${sku}">
        <button type="button" class="qty-btn btn-plus" data-sku="${sku}">+</button>
      </div>
      <div class="prod-price">${parseFloat(prod.price).toFixed(2)}${currency}</div>
      <div class="prod-subtotal" id="subtotal-${sku}">0.00${currency}</div>
    `;

    container.appendChild(row);
  });

  asignarEventos();
}

/**
 * Escucha cambios en inputs y clicks en los botones de +/-
 */
function asignarEventos() {
  // Botones de incremento (+)
  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const sku = btn.dataset.sku;
      const input = document.getElementById(`input-${sku}`);
      let currentVal = parseInt(input.value, 10) || 0;
      currentVal++;
      input.value = currentVal;
      procesarCambioCantidad(sku, currentVal);
    });
  });

  // Botones de decremento (-)
  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const sku = btn.dataset.sku;
      const input = document.getElementById(`input-${sku}`);
      let currentVal = parseInt(input.value, 10) || 0;
      if (currentVal > 0) {
        currentVal--;
        input.value = currentVal;
        procesarCambioCantidad(sku, currentVal);
      }
    });
  });

  // Edición manual directa en el input
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', () => {
      const sku = input.dataset.sku;
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) {
        val = 0;
        input.value = 0;
      }
      procesarCambioCantidad(sku, val);
    });
  });
}

function procesarCambioCantidad(sku, cantidad) {
  carritoInstancia.actualizarUnidades(sku, cantidad);
  
  // Actualizar la columna 'Total' del producto concreto en la tabla
  const prodInfo = carritoInstancia.obtenerInformacionProducto(sku);
  const subtotalElem = document.getElementById(`subtotal-${sku}`);
  if (subtotalElem && prodInfo) {
    subtotalElem.textContent = `${prodInfo.subtotal}${carritoInstancia.currency}`;
  }

  // Refrescar el bloque lateral de resumen
  actualizarVistaCarrito();
}

/**
 * Modifica el DOM del panel lateral (Total y desglose)
 */
/**
 * Modifica el DOM del panel lateral (Total y desglose)
 * Muestra exactamente el formato de la Figura 3:
 * Izquierda: "3 x iPhone 13 Pro"
 * Derecha:   "3 x 938.99€"
 */
function actualizarVistaCarrito() {
  const estadoCarrito = carritoInstancia.obtenerCarrito();
  const summaryBreakdown = document.getElementById('summary-breakdown');
  const finalTotal = document.getElementById('final-total');

  summaryBreakdown.innerHTML = '';

  estadoCarrito.products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    
    // Formato exacto según Figura 3 del enunciado
    row.innerHTML = `
      <span class="breakdown-name">${p.quantity} x ${p.title}</span>
      <span class="breakdown-calc">${p.quantity} x ${p.price.toFixed(2)}${estadoCarrito.currency}</span>
    `;
    summaryBreakdown.appendChild(row);
  });

  finalTotal.textContent = `${estadoCarrito.total}${estadoCarrito.currency}`;
}
