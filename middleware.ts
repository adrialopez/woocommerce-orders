import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Rutas que no requieren autenticación
const publicRoutes = ["/login"]

// Clave secreta para verificar los JWT (debe ser la misma que usamos para firmar)
const JWT_SECRET = new TextEncoder().encode("tu_clave_secreta_muy_segura_para_firmar_jwt")

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta es pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar si es una ruta de API de autenticación
  if (pathname.startsWith("/api/auth/login")) {
    return NextResponse.next()
  }

  // Obtener el token de la cookie
  const token = request.cookies.get("auth_token")?.value

  // Si no hay token, redirigir al login
  if (!token) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  try {
    // Verificar el token
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch (error) {
    // Token inválido o expirado
    console.error("Error verificando token:", error)
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
