import { useEffect, useMemo, useState } from 'react'
import {
  LuPencil,
  LuTrash2,
  LuToggleLeft,
  LuToggleRight,
  LuTrendingUp,
  LuUpload,
  LuImage,
  LuClock3,
  LuStar,
  LuIndianRupee,
} from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import LazyImage from '../../components/common/LazyImage'
import TextField from '../../components/forms/TextField'
import { logEvent, logError } from '../../services/logger'
import {
  createProduct,
  deleteProduct,
  listSellerProducts,
  updateProduct,
  listOrdersForSeller,
  updateOrderStatus,
} from '../../services/firebase/firestore'
import { uploadToCloudinary } from '../../services/cloudinary'
import { useAuth } from '../../context/AuthContext'

const emptyForm = {
  name: '',
  description: '',
  category: '',
  location: '',
  price: '',
  quantity: '',
  preparationTime: '',
  serves: '',
  rating: 0,
  status: 'draft',
  isActive: false,
}

const ManageProductsPage = () => {
  const { user, profile } = useAuth()
  const [products, setProducts] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersError, setOrdersError] = useState(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null)

  const primaryImage = useMemo(
    () => (images[0]?.thumbnailUrl || images[0]?.url || ''),
    [images],
  )

  useEffect(() => {
    logEvent('info', 'seller-products', 'viewed')
    const load = async () => {
      if (!user?.uid) return
      try {
        setLoadingList(true)
        const data = await listSellerProducts(user.uid)
        setProducts(data)
        setError(null)
      } catch (error) {
        logError('seller-products', 'list-failed', error)
        setError('Could not load your products. Pull to refresh or try again.')
      } finally {
        setLoadingList(false)
      }
    }
    load()
  }, [user])

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.uid) return
      setOrdersLoading(true)
      try {
        const data = await listOrdersForSeller(user.uid)
        setOrders(data)
        setOrdersError(null)
      } catch (err) {
        logError('seller-orders', 'list-failed', err)
        setOrdersError('Could not load incoming orders.')
      } finally {
        setOrdersLoading(false)
      }
    }
    loadOrders()
  }, [user])

  const handleImages = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        files.map((file) => uploadToCloudinary(file, 'catering-products')),
      )
      setImages((prev) => [...prev, ...uploads])
      setStatus({ type: 'success', message: 'Images uploaded' })
    } catch (error) {
      logError('cloudinary', 'upload', error)
      setStatus({ type: 'error', message: 'Upload failed. Try again.' })
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setImages([])
    setEditingId(null)
  }

  const submitProduct = async (publish = true) => {
    if (!user?.uid) {
      setStatus({ type: 'error', message: 'Login required' })
      return
    }
    setLoading(true)
    setStatus(null)
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      serves: Number(form.serves) || 0,
      rating: Number(form.rating) || 0,
      location: form.location || profile?.address || 'India',
      status: publish ? 'active' : 'draft',
      isActive: publish ? true : Boolean(form.isActive),
      sellerId: user.uid,
      sellerName: profile?.name || user.displayName || 'Seller',
      images: images.map((img) => img.url || img.thumbnailUrl).filter(Boolean),
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)),
        )
        setStatus({ type: 'success', message: 'Product updated' })
      } else {
        const id = await createProduct({
          ...payload,
          ratingTotal: payload.rating || 0,
          ratingCount: payload.rating ? 1 : 0,
        })
        setProducts((prev) => [...prev, { id, ...payload }])
        setStatus({ type: 'success', message: publish ? 'Product published' : 'Saved as draft' })
      }
      resetForm()
    } catch (error) {
      logError('seller-products', 'save-failed', error)
      setStatus({ type: 'error', message: 'Could not save product' })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (product) => {
    const nextActive = !(product.isActive ?? product.status === 'active')
    const nextStatus = nextActive ? 'active' : 'inactive'
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: nextActive, status: nextStatus } : p)),
    )
    try {
      await updateProduct(product.id, { isActive: nextActive, status: nextStatus })
    } catch (err) {
      logError('seller-products', 'status-update-failed', err)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: product.isActive, status: product.status } : p,
        ),
      )
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      location: product.location || '',
      price: product.price || '',
      quantity: product.quantity || '',
      preparationTime: product.preparationTime || '',
      serves: product.serves || '',
      rating: product.rating || 0,
      status: product.status || 'draft',
      isActive: product.isActive ?? product.status === 'active',
    })
    setImages((product.images || []).map((url) => ({ url })))
  }

  const removeProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((item) => item.id !== productId))
    } catch (err) {
      logError('seller-products', 'delete-failed', err, { id: productId })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Sellers
          </p>
          <h1 className="font-display text-3xl text-text-primary">
            Seller dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            Create, edit, activate, or retire your catering experiences.
          </p>
        </div>
        <PrimaryButton variant="outline" icon={<LuTrendingUp />}>
          Performance
        </PrimaryButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <LuUpload />
            {editingId ? 'Edit product' : 'Upload new product'}
          </h2>
          <TextField label="Product name" name="name" value={form.name} onChange={handleChange} required />
          <TextField
            label="Location (city, state)"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
          <label className="block">
            <span className="text-sm text-text-secondary">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-2 w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary shadow-inner outline-none focus:border-accent focus:shadow-glow"
            ></textarea>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Category" name="category" value={form.category} onChange={handleChange} required />
            <TextField
              label="Price (per guest)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              icon={<LuIndianRupee />}
            />
            <TextField
              label="Available quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
            />
            <TextField
              label="Preparation time (hrs)"
              name="preparationTime"
              value={form.preparationTime}
              onChange={handleChange}
            />
            <TextField label="Serves (people)" name="serves" value={form.serves} onChange={handleChange} />
            <TextField
              label="Display rating"
              name="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={handleChange}
              icon={<LuStar />}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="accent-accent"
              />
              Mark as active
            </label>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
              Status: {form.status}
            </span>
          </div>

          <div className="flex gap-3">
            <PrimaryButton variant="outline" onClick={resetForm} className="flex-1">
              Clear
            </PrimaryButton>
            <PrimaryButton
              onClick={() => submitProduct(false)}
              loading={loading || uploading}
              className="flex-1"
              icon={<LuClock3 />}
            >
              Save draft
            </PrimaryButton>
            <PrimaryButton
              onClick={() => submitProduct(true)}
              loading={loading || uploading}
              className="flex-1"
            >
              {editingId ? 'Update & publish' : 'Publish'}
            </PrimaryButton>
          </div>
          {status && (
            <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-danger'}`}>
              {status.message}
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <LuImage /> Images
          </h2>
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-text-secondary transition hover:border-accent">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            <LuUpload className="text-accent" />
            <p>Upload product images</p>
            <p className="text-xs">Cloudinary unsigned uploads</p>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <LazyImage
                key={idx}
                src={img.thumbnailUrl || img.url}
                alt="Preview"
                className="h-28 w-full rounded-xl object-cover"
                placeholderClassName="h-28 w-full rounded-xl"
              />
            ))}
            {!images.length && (
              <div className="h-28 rounded-xl border border-dashed border-border bg-bg-base/60"></div>
            )}
          </div>
          {primaryImage && (
            <p className="text-xs text-text-secondary">Primary image will be used in cards.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Your products</h3>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            {loadingList ? 'Loading…' : `${products.length} items`}
            <button
              className="rounded-lg border border-border px-2 py-1 text-xs hover:border-accent hover:text-accent"
              onClick={async () => {
                if (!user?.uid) return
                setLoadingList(true)
                try {
                  const data = await listSellerProducts(user.uid)
                  setProducts(data)
                  setError(null)
                } catch (err) {
                  setError('Could not refresh products.')
                } finally {
                  setLoadingList(false)
                }
              }}
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </p>
        )}
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-3">
              <LazyImage
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="h-20 w-24 rounded-xl object-cover"
                placeholderClassName="h-20 w-24 rounded-xl"
              />
              <div>
                <p className="text-lg font-semibold text-text-primary">{product.name}</p>
                <p className="text-sm text-text-secondary">
                  ₹{product.price || 0} • Rating {Number(product.rating || 0).toFixed(1)}
                </p>
                <p className="text-xs text-text-secondary">
                  {product.status || 'draft'} • {product.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  product.isActive ? 'border-green-200 bg-green-100 text-green-700' : 'border-amber-200 bg-amber-100 text-amber-700'
                }`}
              >
                {product.isActive ? <LuToggleRight /> : <LuToggleLeft />}
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
              <PrimaryButton variant="outline" icon={<LuPencil />} onClick={() => startEdit(product)}>
                Edit
              </PrimaryButton>
              <PrimaryButton variant="outline" onClick={() => toggleStatus(product)}>
                Toggle
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                icon={<LuStar />}
                onClick={() =>
                  updateProduct(product.id, {
                    rating: (product.rating || 0).toFixed ? Number(product.rating) : 0,
                  }).catch((err) =>
                    logError('seller-products', 'rating-update-failed', err, { id: product.id }),
                  )
                }
              >
                Sync rating
              </PrimaryButton>
              <button
                className="rounded-full border border-border p-2 text-danger hover:border-danger"
                onClick={() => removeProduct(product.id)}
                aria-label="Delete product"
              >
                <LuTrash2 />
              </button>
            </div>
          </div>
        ))}
        {!products.length && (
          <p className="rounded-2xl border border-border bg-bg-elevated/70 p-4 text-sm text-text-secondary">
            No products yet. Publish your first experience above.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Incoming orders</h3>
          <span className="text-sm text-text-secondary">
            {ordersLoading ? 'Loading…' : `${orders.length} orders`}
          </span>
        </div>
        {ordersError && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {ordersError}
          </p>
        )}
        {orders.map((order) => {
          const firstItem = order.items?.[0] || {}
          const buyer = order.buyerName || order.buyerEmail || 'Buyer'
          return (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <LazyImage
                  src={firstItem.image}
                  alt={firstItem.name || 'Order item'}
                  className="h-16 w-16 rounded-xl object-cover"
                  placeholderClassName="h-16 w-16 rounded-xl"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toDateString() : 'Recent'}
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {firstItem.name || 'Order'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Qty {firstItem.qty || 1} • ₹{order.totalAmount || 0} • {buyer}
                  </p>
                  {order.specialInstructions && (
                    <p className="text-xs text-text-secondary">
                      Note: {order.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-secondary">
                  {order.status || 'Pending'}
                </span>
                {order.status === 'Pending' && (
                  <>
                    <PrimaryButton
                      variant="outline"
                      onClick={() =>
                        updateOrderStatus(order.id, 'Confirmed').catch((err) =>
                          logError('seller-orders', 'approve-failed', err, { id: order.id }),
                        )
                      }
                    >
                      Approve
                    </PrimaryButton>
                    <PrimaryButton
                      variant="outline"
                      onClick={() =>
                        updateOrderStatus(order.id, 'Cancelled').catch((err) =>
                          logError('seller-orders', 'reject-failed', err, { id: order.id }),
                        )
                      }
                    >
                      Reject
                    </PrimaryButton>
                  </>
                )}
              </div>
            </div>
          )
        })}
        {!ordersLoading && !orders.length && (
          <p className="rounded-2xl border border-border bg-bg-elevated/70 p-4 text-sm text-text-secondary">
            No incoming orders yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default ManageProductsPage