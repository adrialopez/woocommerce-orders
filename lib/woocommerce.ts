import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

// Crear instancia de la API de WooCommerce
const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || "",
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
  version: "wc/v3",
})

export async function getOrders(status = "pending,processing,on-hold") {
  try {
    const response = await api.get("orders", {
      status: status,
      per_page: 100, // Ajusta según tus necesidades
    })

    // Asegurarse de que response.data es un array
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("Error al obtener pedidos de WooCommerce:", error)
    // Devolver un array vacío en caso de error
    return []
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await api.put(`orders/${orderId}`, {
      status: status,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error(`Error al actualizar el estado del pedido ${orderId}:`, error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getOrderNotes(orderId) {
  try {
    const response = await api.get(`orders/${orderId}/notes`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener notas del pedido ${orderId}:`, error)
    throw error
  }
}
