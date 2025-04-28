import { NextResponse } from "next/server"
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

// Crear instancia de la API de WooCommerce
const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || "",
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
  version: "wc/v3",
})

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending,processing,on-hold"
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "50" // Aumentado para ver más pedidos
  const search = searchParams.get("search") || ""
  const orderby = searchParams.get("orderby") || "date"
  const order = searchParams.get("order") || "desc"

  console.log("WooCommerce API Request:", {
    url: process.env.WOOCOMMERCE_URL,
    hasConsumerKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
    hasConsumerSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
    params: { status, page, perPage, search, orderby, order },
  })

  try {
    // Construir los parámetros de la solicitud
    const params = {
      per_page: perPage,
      page,
      search,
      orderby,
      order,
    }

    // Solo añadir status si no está vacío
    if (status) {
      params.status = status
    }

    console.log("Requesting orders with params:", params)

    const response = await api.get("orders", params)

    console.log("WooCommerce API Response:", {
      status: response.status,
      headers: {
        "x-wp-total": response.headers["x-wp-total"],
        "x-wp-totalpages": response.headers["x-wp-totalpages"],
      },
      dataLength: Array.isArray(response.data) ? response.data.length : "not an array",
      dataType: typeof response.data,
    })

    // Asegurarse de que response.data es un array
    const ordersData = Array.isArray(response.data) ? response.data : []

    return NextResponse.json({
      success: true,
      data: ordersData,
      totalPages: Number.parseInt(response.headers["x-wp-totalpages"] || "1"),
      total: Number.parseInt(response.headers["x-wp-total"] || "0"),
      debug: {
        url: process.env.WOOCOMMERCE_URL ? "Configurada" : "No configurada",
        hasCredentials: !!(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET),
        params: { status, page, perPage, search, orderby, order },
      },
    })
  } catch (error) {
    console.error("Error al obtener datos de WooCommerce:", error)

    // Extraer información útil del error
    const errorInfo = {
      message: error.message,
      code: error.code,
      statusCode: error.response?.status,
      responseData: error.response?.data,
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener datos",
        error: errorInfo,
        debug: {
          url: process.env.WOOCOMMERCE_URL ? "Configurada" : "No configurada",
          hasCredentials: !!(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET),
          params: { status, page, perPage, search, orderby, order },
        },
        // Devolver un array vacío en caso de error
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId) {
      return NextResponse.json({ success: false, message: "ID de pedido no proporcionado" }, { status: 400 })
    }

    console.log(`Updating order ${orderId} to status ${status}`)

    const response = await api.put(`orders/${orderId}`, {
      status: status,
    })

    return NextResponse.json({
      success: true,
      data: response.data,
    })
  } catch (error) {
    console.error("Error al actualizar pedido en WooCommerce:", error)

    // Extraer información útil del error
    const errorInfo = {
      message: error.message,
      code: error.code,
      statusCode: error.response?.status,
      responseData: error.response?.data,
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar pedido",
        error: errorInfo,
      },
      { status: 500 },
    )
  }
}
