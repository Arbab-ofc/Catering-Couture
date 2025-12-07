import { useEffect, useRef, useState } from 'react'

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  ...props
}) => {
  const imgRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${placeholderClassName}`}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-bg-muted to-bg-elevated"></div>
      )}
      {visible && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage
