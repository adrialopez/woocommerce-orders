"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Printer, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Package } from "lucide-react"
import { OrderDetails } from "./order-details"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("pending,processing,on-hold")
  const [expandedOrders, setExpandedOrders] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchOrders = async (filters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      // Asegurarse de que el estado del filtro se incluya en la solicitud
      const queryParams = new URLSearchParams({
        ...filters,
        status: filters.status || filterStatus,
      })

      console.log("Fetching orders with params:", queryParams.toString())
      const response = await fetch(`/api/woocommerce?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      if (data.success) {
        // Asegurarse de que data.data es un array
        if (Array.isArray(data.data)) {
          setOrders(data.data)
          console.log(`Loaded ${data.data.length} orders`)
        } else {
          console.error("La respuesta no contiene un array:", data)
          setOrders([])
          setError("La respuesta de la API no tiene el formato esperado")
        }
      } else {
        throw new Error(data.message || "Error al obtener pedidos")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: `No se pudieron cargar los pedidos: ${err.message}`,
        variant: "destructive",
      })
      // Asegurarse de que orders sea un array vacío en caso de error
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Escuchar eventos de búsqueda y actualización
  useEffect(() => {
    const handleSearch = (event) => {
      const { search, status, orderBy } = event.detail

      // Actualizar el estado del filtro
      if (status) {
        setFilterStatus(status === "all" ? "" : status)
      }

      fetchOrders({
        search,
        status: status === "all" ? "" : status,
        orderby: orderBy?.split("-")[0] || "date",
        order: orderBy?.includes("-desc") ? "desc" : "asc",
      })
    }

    const handleRefresh = () => {
      fetchOrders()
    }

    window.addEventListener("search-orders", handleSearch)
    window.addEventListener("refresh-orders", handleRefresh)

    return () => {
      window.removeEventListener("search-orders", handleSearch)
      window.removeEventListener("refresh-orders", handleRefresh)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Pendiente", variant: "destructive" },
      processing: { label: "Procesando", variant: "warning" },
      "on-hold": { label: "En espera", variant: "secondary" },
      completed: { label: "Completado", variant: "success" },
      cancelled: { label: "Cancelado", variant: "outline" },
      refunded: { label: "Reembolsado", variant: "outline" },
      failed: { label: "Fallido", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "outline" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/woocommerce", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: `Pedido #${orderId} actualizado a ${newStatus}`,
        })

        // Actualizar la lista de pedidos
        fetchOrders()
      } else {
        throw new Error(data.message || "Error al actualizar el pedido")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el pedido: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      console.error("Error formatting date:", e)
      return dateString
    }
  }

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    // Implementar búsqueda en tiempo real si es necesario
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button size="sm">Exportar a Excel</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => fetchOrders()} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="mb-4">No hay pedidos con los filtros seleccionados.</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={() => fetchOrders({ status: "" })}>Ver todos los pedidos</Button>
              <Button variant="outline" onClick={() => fetchOrders()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[100px]">Nº Pedido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow className="group">
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleOrderExpand(order.id)}
                          >
                            {expandedOrders[order.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">#{order.number || order.id}</TableCell>
                        <TableCell>{formatDate(order.date_created)}</TableCell>
                        <TableCell>
                          {order.billing?.first_name} {order.billing?.last_name}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.payment_method_title || "En efectivo al momento de la entrega"}</TableCell>
                        <TableCell>
                          {order.currency_symbol || "$"}
                          {order.total}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalles</span>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Imprimir</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Marcar como completado</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedOrders[order.id] && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0 border-t-0">
                            <div className="bg-muted/20 px-4 py-3 border-t">
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1" /> Productos a preparar
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {order.line_items && order.line_items.length > 0 ? (
                                  order.line_items.map((item) => (
                                    <Card
                                      key={item.id}
                                      className="p-3 border-l-4 border-l-primary flex-1 min-w-[250px] max-w-[400px]"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-xs text-muted-foreground font-mono mt-1">
                                            {item.sku || "Sin SKU"}
                                          </p>

                                          {/* Mostrar metadatos como tallas */}
                                          {item.meta_data && item.meta_data.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-dashed text-xs">
                                              {item.meta_data.map((meta, index) => (
                                                <div key={index} className="flex justify-between">
                                                  <span className="font-medium">{meta.key}:</span>
                                                  <span>{meta.value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Simular información de talla y stock */}
                                          <div className="mt-2 pt-2 border-t border-dashed text-xs">
                                            <div className="flex justify-between">
                                              <span className="font-medium">pa_talla:</span>
                                              <span>{item.size || "14"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="font-medium">_reduced_stock:</span>
                                              <span>{item.quantity}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <Badge className="ml-2">{item.quantity}</Badge>
                                      </div>
                                    </Card>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No hay productos en este pedido.</p>
                                )}
                              </div>
                              {order.customer_note && (
                                <div className="mt-3 pt-2 border-t">
                                  <p className="text-sm font-medium">Nota del cliente:</p>
                                  <p className="text-sm text-muted-foreground">{order.customer_note}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{selectedOrder?.number || selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetails order={selectedOrder} onStatusUpdate={fetchOrders} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
