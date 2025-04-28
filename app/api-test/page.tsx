"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const runTests = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()

      if (response.ok) {
        setResults(data)
      } else {
        throw new Error(data.message || "Error al realizar las pruebas")
      }
    } catch (err) {
      console.error("Error running tests:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const renderStatusBadge = (status) => {
    if (status === "success") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" /> Correcto
        </Badge>
      )
    } else if (status === "warning") {
      return (
        <Badge variant="warning">
          <AlertCircle className="h-3 w-3 mr-1" /> Advertencia
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Error
        </Badge>
      )
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Prueba de Conexión a WooCommerce</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verificación de Credenciales API</CardTitle>
          <CardDescription>
            Comprueba que las claves API de WooCommerce están configuradas correctamente y tienen los permisos
            necesarios.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Ejecutando pruebas...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Variables de Entorno</h3>
                      {renderStatusBadge(results.environmentVars.status)}
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>URL:</span>
                        <span>{results.environmentVars.url ? "✓ Configurada" : "✗ No configurada"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Consumer Key:</span>
                        <span>{results.environmentVars.consumerKey ? "✓ Configurada" : "✗ No configurada"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Consumer Secret:</span>
                        <span>{results.environmentVars.consumerSecret ? "✓ Configurada" : "✗ No configurada"}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Conexión a WooCommerce</h3>
                      {renderStatusBadge(results.connection.status)}
                    </div>
                    <p className="text-sm mb-2">{results.connection.message}</p>
                    {results.connection.details && (
                      <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(results.connection.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Permisos de API</h3>
                    {renderStatusBadge(results.permissions.status)}
                  </div>
                  <p className="text-sm mb-2">{results.permissions.message}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {results.permissions.endpoints.map((endpoint) => (
                      <div key={endpoint.name} className="border rounded p-3 bg-background">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{endpoint.name}</span>
                          {endpoint.success ? (
                            <Badge className="bg-green-500">Accesible</Badge>
                          ) : (
                            <Badge variant="destructive">No accesible</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{endpoint.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recomendaciones</h3>
                    <ul className="space-y-2 text-sm">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter>
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ejecutando...
              </>
            ) : (
              "Ejecutar pruebas de nuevo"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-muted p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-2">¿Cómo verificar los permisos de las claves API?</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Accede al panel de administración de tu tienda WooCommerce</li>
          <li>
            Ve a <strong>WooCommerce &gt; Ajustes &gt; Avanzado &gt; API REST</strong>
          </li>
          <li>Busca tus claves API o crea unas nuevas</li>
          <li>
            Asegúrate de que las claves tienen permisos de <strong>Lectura</strong> para <strong>Pedidos</strong>
          </li>
          <li>
            Si necesitas crear nuevas claves, selecciona <strong>Lectura/Escritura</strong> en los permisos
          </li>
          <li>Después de crear o actualizar las claves, actualiza las variables de entorno en tu proyecto</li>
        </ol>
      </div>
    </div>
  )
}
