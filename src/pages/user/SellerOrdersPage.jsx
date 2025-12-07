import { useEffect, useState } from 'react'
import { LuCircleCheckBig, LuCircleX, LuTimer, LuFilter } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import { logEvent, logError } from '../../services/logger'
import { listOrdersForSeller, updateOrderStatus } from '../../services/firebase/firestore'
import { useAuth } from '../../context/AuthContext'

const SellerOrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    logEvent('info', 'seller-orders', 'viewed')
    const load = async () => {
      if (!user?.uid) return
      try {
        const data = await listOrdersForSeller(user.uid)
        setOrders(data)
        setError(null)
      } catch (error) {
        logError('seller-orders', 'list-failed', error)
        setError('Could not load incoming orders.')
      }
    }
    load()
  }, [user])

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      )
    } catch (error) {
      logError('seller-orders', 'status-update-failed', error, { id, status })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Fulfilment
          </p>
          <h1 className="font-display text-3xl text-text-primary">Incoming orders</h1>
        </div>
        <PrimaryButton variant="outline" icon={<LuFilter />}>
          Filter by status
        </PrimaryButton>
      </div>

      <div className="space-y-3">
        {error && <p className="text-danger text-sm">{error}</p>}
        {orders.length === 0 && (
          <p className="text-text-secondary">
            No incoming orders yet.
          </p>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
                {(order.createdAt?.toDate && order.createdAt.toDate().toDateString()) ||
                  order.date ||
                  'Recent'}{' '}
                • {order.id}
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {order.buyerName || 'Buyer'}
              </p>
              <p className="text-sm text-text-secondary">
                {order.items?.length || 0} items • {order.specialInstructions || 'No notes'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-sm text-text-secondary">
                ₹{order.totalAmount || order.total || 0}
              </span>
              <PrimaryButton
                variant="outline"
                icon={<LuCircleCheckBig />}
                className="whitespace-nowrap"
                onClick={() => handleStatus(order.id, 'Confirmed')}
              >
                Accept
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                icon={<LuCircleX />}
                className="whitespace-nowrap"
                onClick={() => handleStatus(order.id, 'Cancelled')}
              >
                Reject
              </PrimaryButton>
              <PrimaryButton variant="ghost" icon={<LuTimer />}>
                {order.status || 'Pending'}
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SellerOrdersPage
