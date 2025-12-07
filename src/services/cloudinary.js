import { logEvent, logError } from './logger'

const CLOUD_NAME = 'dknu6pc0s'
const UPLOAD_PRESET = 'catering'

const buildTransformUrl = (url, transformation) =>
  url?.replace('/upload/', `/upload/${transformation}/`)

export const toThumbnail = (url) => buildTransformUrl(url, 'w_600,f_auto,q_auto')
export const toCardImage = (url) =>
  buildTransformUrl(url, 'w_900,h_700,c_fill,f_auto,q_auto')

export const uploadToCloudinary = async (file, folder = 'products') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  try {
    const start = performance.now()
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Upload failed')

    const duration = Math.round(performance.now() - start)
    logEvent('info', 'cloudinary', 'upload-success', {
      assetId: data.asset_id,
      secureUrl: data.secure_url,
      duration,
    })

    return {
      url: data.secure_url,
      thumbnailUrl: toThumbnail(data.secure_url),
      cardUrl: toCardImage(data.secure_url),
    }
  } catch (error) {
    logError('cloudinary', 'upload-failed', error, { fileName: file.name })
    throw error
  }
}