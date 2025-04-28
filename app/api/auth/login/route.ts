import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

// En un entorno real, estas credenciales estarían en una base de datos
// y las contraseñas estarían hasheadas
const USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // En producción, usar contraseñas más seguras
    role: "admin",
  },
  {
    id: 2,
    username: "almacen",
    password: "almacen123",
    role: "warehouse",
  },
]

// Clave secreta para firmar los JWT
// En producción, usar una clave segura y almacenarla en variables de entorno
const JWT_SECRET = new TextEncoder().encode("tu_clave_secreta_muy_segura_para_firmar_jwt")

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Buscar el usuario
    const user = USERS.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    // Crear token JWT
    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(JWT_SECRET)

    // Establecer cookie con el token
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      maxAge: 60 * 60 * 8, // 8 horas en segundos
    })

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
    })
  } catch (error) {
    console.error("Error en inicio de sesión:", error)
    return NextResponse.json({ success: false, message: "Error en el servidor" }, { status: 500 })
  }
}
