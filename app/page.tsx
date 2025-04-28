import { OrdersList } from "@/components/orders-list"
import { OrdersHeader } from "@/components/orders-header"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <OrdersHeader />
        <OrdersList />
      </main>
    </>
  )
}
