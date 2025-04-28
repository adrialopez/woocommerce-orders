"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export function OrdersHeader() {
  const [status, setStatus] = useState("pending,processing,on-hold")
  const [orderBy, setOrderBy] = useState("date-desc")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleRefresh = () => {
    const event = new CustomEvent("refresh-orders")
    window.dispatchEvent(event)

    toast({
      title: "Actualizando",
      description: "Obteniendo los pedidos más recientes...",
    })
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Aquí implementarías la lógica para exportar pedidos a Excel
      toast({
        title: "Exportación iniciada",
        description: "El archivo se descargará en breve.",
      })

      // Simulación de descarga
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Exportación completada",
        description: "Los pedidos se han exportado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los pedidos.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
      <h2 className="text-xl font-semibold">Gestión de Pedidos</h2>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            // Trigger search on status change
            const event = new CustomEvent("search-orders", {
              detail: { status: value, orderBy },
            })
            window.dispatchEvent(event)
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Estado del pedido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending,processing,on-hold">Pendientes</SelectItem>
            <SelectItem value="pending">Solo pendientes</SelectItem>
            <SelectItem value="processing">Solo procesando</SelectItem>
            <SelectItem value="on-hold">Solo en espera</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={orderBy}
          onValueChange={(value) => {
            setOrderBy(value)
            // Trigger search on order change
            const event = new CustomEvent("search-orders", {
              detail: { status, orderBy: value },
            })
            window.dispatchEvent(event)
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
            <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
            <SelectItem value="id-desc">Número de pedido (mayor)</SelectItem>
            <SelectItem value="id-asc">Número de pedido (menor)</SelectItem>
            <SelectItem value="total-desc">Total (mayor)</SelectItem>
            <SelectItem value="total-asc">Total (menor)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
