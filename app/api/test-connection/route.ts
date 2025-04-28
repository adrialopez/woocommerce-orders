import { NextResponse } from "next/server"
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

export async function GET() {
  const results = {
    environmentVars: {
      status: "error",
      url: false,
      consumerKey: false,
      consumerSecret: false,
    },
    connection: {
      status: "error",
      message: "No se ha intentado la conexión",
      details: null,
    },
    permissions: {
      status: "error",
      message: "No se han verificado los permisos",
      endpoints: [],
    },
    recommendations: [],
  }

  // Verificar variables de entorno
  const url = process.env.WOOCOMMERCE_URL
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET

  results.environmentVars.url = !!url
  results.environmentVars.consumerKey = !!consumerKey
  results.environmentVars.consumerSecret = !!consumerSecret

  if (url && consumerKey && consumerSecret) {
    results.environmentVars.status = "success"
  } else {
    results.environmentVars.status = "error"
    results.recommendations.push(
      "Configura todas las variables de entorno necesarias: WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY y WOOCOMMERCE_CONSUMER_SECRET",
    )
    return NextResponse.json(results)
  }

  // Crear instancia de la API
  const api = new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: "wc/v3",
  })

  // Probar conexión básica
  try {
    // Intentar obtener información de la tienda
    const response = await api.get("system_status")

    results.connection.status = "success"
    results.connection.message = "Conexión exitosa a la API de WooCommerce"
    results.connection.details = {
      environment: response.data.environment?.version || "Desconocido",
      woocommerce_version: response.data.environment?.wc_version || "Desconocido",
    }
  } catch (error) {
    results.connection.status = "error"
    results.connection.message = `Error de conexión: ${error.message}`
    results.connection.details = {
      code: error.code,
      statusCode: error.response?.status,
      data: error.response?.data,
    }

    // Añadir recomendaciones basadas en el error
    if (error.response?.status === 401) {
      results.recommendations.push(
        "Las credenciales de API son incorrectas. Verifica tu Consumer Key y Consumer Secret.",
      )
    } else if (error.code === "ENOTFOUND") {
      results.recommendations.push("No se pudo encontrar el dominio. Verifica que la URL de WooCommerce es correcta.")
    } else if (error.code === "ECONNREFUSED") {
      results.recommendations.push(
        "Conexión rechazada. Verifica que la tienda WooCommerce es accesible desde el servidor.",
      )
    }

    return NextResponse.json(results)
  }

  // Verificar permisos específicos
  const endpoints = [
    { name: "Listar Pedidos", path: "orders", method: "get" },
    { name: "Actualizar Pedido", path: "orders/1", method: "put" },
    { name: "Listar Productos", path: "products", method: "get" },
    { name: "Listar Clientes", path: "customers", method: "get" },
  ]

  const permissionResults = []
  let permissionsSuccess = true

  for (const endpoint of endpoints) {
    try {
      // Para PUT, enviamos un objeto vacío para evitar modificar datos reales
      if (endpoint.method === "put") {
        await api[endpoint.method](endpoint.path, {})
      } else {
        await api[endpoint.method](endpoint.path, { per_page: 1 })
      }

      permissionResults.push({
        name: endpoint.name,
        success: true,
        message: "Acceso permitido",
      })
    } catch (error) {
      permissionsSuccess = false

      let message = "Acceso denegado"
      if (error.response?.status === 401) {
        message = "Error de autenticación"
      } else if (error.response?.status === 403) {
        message = "Permiso denegado"
      } else if (error.response?.status === 404) {
        message = "Endpoint no encontrado"
      } else {
        message = `Error: ${error.message}`
      }

      permissionResults.push({
        name: endpoint.name,
        success: false,
        message,
      })

      // Añadir recomendaciones específicas
      if (endpoint.name === "Listar Pedidos" && !permissionResults[permissionResults.length - 1].success) {
        results.recommendations.push(
          "La API no tiene permisos para acceder a los pedidos. Verifica que las claves API tienen permisos de lectura para pedidos.",
        )
      }
    }
  }

  results.permissions.endpoints = permissionResults

  if (permissionsSuccess) {
    results.permissions.status = "success"
    results.permissions.message = "Todos los endpoints son accesibles"
  } else {
    const accessibleCount = permissionResults.filter((r) => r.success).length
    if (accessibleCount > 0) {
      results.permissions.status = "warning"
      results.permissions.message = `${accessibleCount} de ${endpoints.length} endpoints son accesibles`
    } else {
      results.permissions.status = "error"
      results.permissions.message = "No se pudo acceder a ningún endpoint"
      results.recommendations.push(
        "Las claves API no tienen los permisos necesarios. Crea nuevas claves con permisos de Lectura/Escritura.",
      )
    }
  }

  return NextResponse.json(results)
}
