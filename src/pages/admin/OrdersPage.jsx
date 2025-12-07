import { useEffect, useState } from 'react'
import { LuArrowRight, LuClock3, LuCircleCheckBig, LuCircleX, LuStar } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import { logEvent, logError } from '../../services/logger'
import {
  listOrdersForBuyer,
  addProductRating,
  getProduct,
  updateOrderItemRating,
} from '../../services/firebase/firestore'
import { useAuth } from '../../context/AuthContext'

const badgeClass = {
  Confirmed: 'bg-green-100 text-green-700 border-green-200',
  Preparing: 'bg-amber-100 text-amber-700 border-amber-200',
  Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const OrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [ratings, setRatings] = useState({})
  const [ratingStatus, setRatingStatus] = useState(null)

  useEffect(() => {
    logEvent('info', 'orders', 'viewed')
    const load = async () => {
      if (!user?.uid) return
      try {
        const data = await listOrdersForBuyer(user.uid)
        setOrders(data)
        setError(null)

        // Seed rating selections from user rating on order or live product rating (default 5)
        const initial = { ...ratings }
        await Promise.all(
          data.map(async (order) => {
            const firstItem = order.items?.[0]
            const userRating = firstItem?.ratingUser || firstItem?.rating
            if (firstItem?.productId && !initial[firstItem.productId]) {
              if (userRating) {
                initial[firstItem.productId] = userRating
              } else {
                try {
                  const prod = await getProduct(firstItem.productId)
                  initial[firstItem.productId] = prod?.rating || 5
                } catch (err) {
                  logError('orders', 'get-product-rating-failed', err, {
                    productId: firstItem.productId,
                  })
                }
              }
            }
          }),
        )
        setRatings(initial)
      } catch (error) {
        logError('orders', 'list-ui-failed', error)
        setError('Could not load orders. Please try again.')
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            History
          </p>
          <h1 className="font-display text-3xl text-text-primary">My orders</h1>
        </div>
        <PrimaryButton variant="outline" icon={<LuArrowRight />}>
          Reorder favourites
        </PrimaryButton>
      </div>

      <div className="space-y-3">
        {error && <p className="text-danger text-sm">{error}</p>}
        {orders.length === 0 && (
          <div className="rounded-2xl border border-border bg-bg-elevated/80 p-6 text-center shadow-subtle">
            <p className="text-lg font-semibold text-text-primary">
              You haven&apos;t added any order yet.
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Explore our curated menus and start building your experience.
            </p>
            <PrimaryButton className="mt-4" onClick={() => (window.location.href = '/products')}>
              Shop now
            </PrimaryButton>
          </div>
        )}

        {orders.map((order) => {
          const firstItem = order.items?.[0] || {}
          const img = firstItem.image
          const orderDate = order.createdAt?.toDate
            ? order.createdAt.toDate().toDateString()
            : order.date || 'Recent'
          const userHasRated = Boolean(firstItem.ratingUser)
          const userRating = firstItem.ratingUser
          const currentSelection =
            ratings[firstItem.productId] ||
            firstItem.ratingUser ||
            firstItem.rating ||
            firstItem.productRating ||
            5

          return (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                {img && (
                  <img
                    src={img}
                    alt={firstItem.name || 'Order item'}
                    className="h-16 w-16 rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
                    {orderDate}
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {firstItem.name || 'Order'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    ₹{order.totalAmount || order.total || 0} •{' '}
                    {order.sellerName || 'Seller'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass[order.status]}`}
                >
                  {order.status === 'Confirmed' && <LuCircleCheckBig />}
                  {order.status === 'Preparing' && <LuClock3 />}
                  {order.status === 'Delivered' && <LuCircleCheckBig />}
                  {order.status === 'Cancelled' && <LuCircleX />}
                  {order.status}
                </span>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.12em] text-text-secondary">
                    Total
                  </p>
                  <p className="text-xl font-semibold text-text-primary">
                    ₹{order.totalAmount || order.total || 0}
                  </p>
                </div>
              </div>
              {firstItem.productId && (
                <div className="flex flex-col gap-2 md:items-end">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={userHasRated}
                        onClick={() =>
                          setRatings((prev) => ({
                            ...prev,
                            [firstItem.productId]: value,
                          }))
                        }
                        className="text-accent transition hover:scale-110 focus:outline-none"
                      >
                        <LuStar
                          size={18}
                          className={
                            currentSelection >= value
                              ? 'fill-accent text-accent'
                              : 'text-text-secondary'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <PrimaryButton
                    variant="ghost"
                    disabled={userHasRated}
                    onClick={async () => {
                      const selected = ratings[firstItem.productId] || userRating || 5
                      try {
                        await addProductRating(firstItem.productId, selected)
                        await updateOrderItemRating(order.id, firstItem.productId, selected)
                        setRatings((prev) => ({
                          ...prev,
                          [firstItem.productId]: selected,
                        }))
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? {
                                  ...o,
                                  items: [
                                    { ...firstItem, ratingUser: selected },
                                    ...(o.items?.slice(1) || []),
                                  ],
                                }
                              : o,
                          ),
                        )
                        setRatingStatus('Thanks for rating!')
                      } catch (err) {
                        setRatingStatus('Rating failed. Try again.')
                      }
                    }}
                  >
                    {userHasRated ? 'Already rated' : 'Submit rating'}
                  </PrimaryButton>
                </div>
              )}
            </div>
          )
        })}
        {ratingStatus && (
          <p className="text-sm text-text-secondary">{ratingStatus}</p>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
