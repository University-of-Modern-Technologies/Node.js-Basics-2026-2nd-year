import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockConfig, mockUploadStream, mockStreamEnd } = vi.hoisted(() => ({
  mockConfig: vi.fn(),
  mockUploadStream: vi.fn(),
  mockStreamEnd: vi.fn(),
}))

vi.mock('cloudinary', () => ({
  v2: {
    config: mockConfig,
    uploader: {
      upload_stream: mockUploadStream,
    },
  },
}))

import { uploadAvatar } from '../../../src/services/cloudinary.js'

describe('cloudinary service', () => {
  let uploadCallback

  beforeEach(() => {
    uploadCallback = undefined
    mockUploadStream.mockClear()
    mockStreamEnd.mockClear()

    mockUploadStream.mockImplementation((options, callback) => {
      uploadCallback = callback
      return { end: mockStreamEnd }
    })
  })

  it('configures cloudinary client on module load', () => {
    expect(mockConfig).toHaveBeenCalledWith(
      expect.objectContaining({ secure: true }),
    )
  })

  it('uploads avatar with correct stream options', async () => {
    const buffer = Buffer.from('fake-image')
    const result = { secure_url: 'https://cdn.example/avatar.jpg', public_id: 'avatars/user_7' }

    const promise = uploadAvatar(buffer, 7)

    expect(mockUploadStream).toHaveBeenCalledWith(
      {
        folder: 'avatars',
        public_id: 'user_7',
        overwrite: true,
        resource_type: 'image',
      },
      expect.any(Function),
    )
    expect(mockStreamEnd).toHaveBeenCalledWith(buffer)

    uploadCallback(null, result)

    await expect(promise).resolves.toEqual(result)
  })

  it('rejects when cloudinary upload fails', async () => {
    const buffer = Buffer.from('fake-image')
    const uploadError = new Error('Cloudinary upload failed')

    const promise = uploadAvatar(buffer, 3)

    expect(mockStreamEnd).toHaveBeenCalledWith(buffer)

    uploadCallback(uploadError)

    await expect(promise).rejects.toThrow('Cloudinary upload failed')
  })
})
