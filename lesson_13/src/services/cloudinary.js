import { v2 as cloudinary } from 'cloudinary'

const cloudinaryConfig = {
  secure: true,
}

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinaryConfig.cloud_name = process.env.CLOUDINARY_CLOUD_NAME
}

if (process.env.CLOUDINARY_API_KEY) {
  cloudinaryConfig.api_key = process.env.CLOUDINARY_API_KEY
}

if (process.env.CLOUDINARY_API_SECRET) {
  cloudinaryConfig.api_secret = process.env.CLOUDINARY_API_SECRET
}

cloudinary.config(cloudinaryConfig)

export const uploadAvatar = (buffer, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      },
    )

    stream.end(buffer)
  })
