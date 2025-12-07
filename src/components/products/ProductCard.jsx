import { LuStar, LuShoppingCart, LuMapPin } from 'react-icons/lu'
import PrimaryButton from '../common/PrimaryButton'
import LazyImage from '../common/LazyImage'

const ProductCard = ({ product, onQuickAdd }) => {
  const ratingNumber = Number(product.rating)
  const {
    name,
    price,
    rating = Number.isFinite(ratingNumber) ? ratingNumber : 0,
    image = product.images?.[0],
    seller = product.sellerName || product.seller || 'Master Chef',
    location = 'Goa, India',
    category = 'Signature Feast',
  } = product

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-bg-elevated/90 via-bg-elevated/80 to-bg-base/90 shadow-card backdrop-blur-xl transition-all duration-300 ease-soft-spring hover:-translate-y-2 hover:shadow-glow">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="aspect-[3/2] w-full overflow-hidden">
          <LazyImage
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            placeholderClassName="h-full w-full"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60"></div>
      </div>
      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-text-secondary">
          <span>{category}</span>
          <span className="flex items-center gap-1 text-accent">
            <LuStar size={16} /> {rating > 0 ? rating.toFixed(1) : 'New'}
          </span>
        </div>
        <h3 className="font-display text-xl text-text-primary">{name}</h3>
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <LuMapPin size={16} className="text-accent" />
          {location}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
              Starting at
            </p>
            <p className="text-2xl font-semibold text-text-primary">₹{price}</p>
          </div>
          <PrimaryButton
            icon={<LuShoppingCart />}
            onClick={() => onQuickAdd?.(product)}
          >
            Add
          </PrimaryButton>
        </div>
        <p className="text-xs text-text-secondary">By {seller}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 transition group-hover:opacity-100"></div>
    </div>
  )
}

export default ProductCard