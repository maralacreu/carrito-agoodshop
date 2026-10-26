class Carrito {
  /**
   * @param {Array} productos - Listado de productos procedentes de la API
   * @param {string} currency - Divisa de la tienda (por defecto '€')
   */
  constructor(productos = [], currency = '€') {
    this.currency = currency;
    // Guardamos la información base del catálogo y el estado de la compra
    this.productos = productos.map(prod => ({
      sku: prod.SKU || prod.sku,
      title: prod.title,
      price: parseFloat(prod.price) || 0,
      quantity: 0
    }));
  }

  /**
   * Actualiza el número de unidades de un producto según su SKU.
   * Valida que no se admitan valores negativos.
   */
  actualizarUnidades(sku, unidades) {
    const prod = this.productos.find(p => p.sku === sku);
    if (prod) {
      const parsedQty = parseInt(unidades, 10);
      prod.quantity = !isNaN(parsedQty) && parsedQty >= 0 ? parsedQty : 0;
    }
  }

  /**
   * Devuelve los datos de un producto concreto con sus unidades seleccionadas.
   */
  obtenerInformacionProducto(sku) {
    const prod = this.productos.find(p => p.sku === sku);
    if (!prod) return null;
    return {
      sku: prod.sku,
      title: prod.title,
      price: prod.price,
      quantity: prod.quantity,
      subtotal: (prod.price * prod.quantity).toFixed(2)
    };
  }

  /**
   * Devuelve los productos seleccionados y el cálculo del importe total.
   */
  obtenerCarrito() {
    const productosSeleccionados = this.productos
      .filter(p => p.quantity > 0)
      .map(p => ({
        sku: p.sku,
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        subtotal: (p.price * p.quantity).toFixed(2)
      }));

    const total = this.productos.reduce((acc, curr) => {
      return acc + (curr.price * curr.quantity);
    }, 0);

    return {
      total: total.toFixed(2),
      currency: this.currency,
      products: productosSeleccionados
    };
  }
}