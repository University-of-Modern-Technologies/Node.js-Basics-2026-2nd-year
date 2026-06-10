import createHttpError from 'http-errors'
import multer from 'multer'

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
      return
    }

    cb(
      createHttpError(
        422,
        'Avatar must be an image file (JPEG, PNG, GIF, or WebP)',
      ),
    )
  },
})

export default uploadAvatar
