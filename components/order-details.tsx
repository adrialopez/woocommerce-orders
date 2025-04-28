"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer, Package } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function OrderDetails({ order, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

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

  const handlePrepareOrder = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/woocommerce", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          status: "processing",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: `Pedido #${order.number || order.id} marcado como en procesamiento`,
        })

        if (onStatusUpdate) {
          onStatusUpdate({ status: "pending,processing,on-hold" })
        }
      } else {
        throw new Error(data.message || "Error al actualizar el pedido")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el pedido: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Pedido #{order.number || order.id}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-sm text-muted-foreground">Fecha: {formatDate(order.date_created)}</p>
          <p className="text-sm text-muted-foreground">
            Cliente: {order.billing?.first_name} {order.billing?.last_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            size="sm"
            onClick={handlePrepareOrder}
            disabled={isUpdating || order.status === "processing" || order.status === "completed"}
          >
            <Package className="h-4 w-4 mr-2" />
            {isUpdating ? "Actualizando..." : "Preparar Pedido"}
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-2">Productos</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.line_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.sku || "N/A"}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{item.quantity}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.currency_symbol || "€"}
                  {Number.parseFloat(item.price).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {order.currency_symbol || "€"}
                  {Number.parseFloat(item.subtotal).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Información de Pago</h4>
          <div className="bg-muted/40 p-3 rounded-md">
            <p className="text-sm">Método de pago: {order.payment_method_title}</p>
            <p className="text-sm">
              Total: {order.currency_symbol || "€"}
              {order.total}
            </p>
            {order.transaction_id && <p className="text-sm">ID de Transacción: {order.transaction_id}</p>}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Dirección de Envío</h4>
          <div className="bg-muted/40 p-3 rounded-md">
            {order.shipping && (
              <>
                <p className="text-sm">
                  {order.shipping.first_name} {order.shipping.last_name}
                </p>
                {order.shipping.company && <p className="text-sm">{order.shipping.company}</p>}
                <p className="text-sm">{order.shipping.address_1}</p>
                {order.shipping.address_2 && <p className="text-sm">{order.shipping.address_2}</p>}
                <p className="text-sm">
                  {order.shipping.postcode} {order.shipping.city}
                </p>
                <p className="text-sm">{order.shipping.country}</p>
              </>
            )}
            {!order.shipping && (
              <p className="text-sm text-muted-foreground italic">No hay información de envío disponible.</p>
            )}
          </div>
        </div>
      </div>

      {order.customer_note && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Notas del Cliente</h4>
            <div className="bg-muted/40 p-3 rounded-md">
              <p className="text-sm">{order.customer_note}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
