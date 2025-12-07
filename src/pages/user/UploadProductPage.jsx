import { useEffect, useState } from 'react'
import { LuUpload, LuImage, LuClock3, LuUsers, LuIndianRupee } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import LazyImage from '../../components/common/LazyImage'
import { uploadToCloudinary } from '../../services/cloudinary'
import { logEvent, logError } from '../../services/logger'
import { createProduct } from '../../services/firebase/firestore'
import { useAuth } from '../../context/AuthContext'

const UploadProductPage = () => {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    price: '',
    quantity: '',
    preparationTime: '',
    serves: '',
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    logEvent('info', 'seller-upload', 'viewed')
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

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

  const handleSubmit = async (publish = true) => {
    if (!user?.uid) {
      setStatus({ type: 'error', message: 'Login required' })
      return
    }
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0,
        serves: Number(form.serves) || 0,
        sellerId: user.uid,
        sellerName: profile?.name || user.displayName || 'Seller',
        status: publish ? 'active' : 'draft',
        location: form.location || profile?.address || 'India',
        rating: 0,
        ratingTotal: 0,
        ratingCount: 0,
        images: images.map((img) => img.url || img.thumbnailUrl).filter(Boolean),
      }
      await createProduct(payload)
      logEvent('info', 'seller-upload', publish ? 'publish' : 'draft', {
        imagesCount: images.length,
      })
      setStatus({
        type: 'success',
        message: publish ? 'Product published' : 'Saved as draft',
      })
    } catch (error) {
      logError('seller-upload', 'save-failed', error)
      setStatus({ type: 'error', message: 'Could not save product' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Sellers
        </p>
        <h1 className="font-display text-3xl text-text-primary">
          Upload catering experience
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">
            Product details
          </h2>
          <TextField
            label="Product name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            <TextField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
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
            <TextField
              label="Serves (people)"
              name="serves"
              value={form.serves}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <LuImage /> Images
          </h2>
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm text-text-secondary transition hover:border-accent">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImages}
            />
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
          </div>

          {status && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${status.type === 'success' ? 'border-green-400 text-green-700' : 'border-red-400 text-red-500'}`}
            >
              {status.message}
            </div>
          )}

          <div className="flex gap-3">
            <PrimaryButton
              variant="outline"
              onClick={() => handleSubmit(false)}
              className="flex-1"
            >
              Save draft
            </PrimaryButton>
            <PrimaryButton
              onClick={() => handleSubmit(true)}
              loading={uploading}
              className="flex-1"
              icon={<LuClock3 />}
            >
              Publish
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadProductPage
