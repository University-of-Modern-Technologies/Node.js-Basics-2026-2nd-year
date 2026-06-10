import { describe, expect, it, vi } from 'vitest'

import { uploadAvatar } from '../../../src/services/cloudinary.js'
import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'

describe('PATCH /api/auth/avatar', () => {
  it('uploads avatar for authenticated user', async () => {
    const { accessToken } = await createUserWithTokens()

    const response = await api(accessToken)
      .patch('/api/auth/avatar')
      .attach('avatar', Buffer.from('fake-image-content'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(200)

    expect(response.body.user.avatar).toBe(
      'https://res.cloudinary.com/test/image/upload/avatar.jpg',
    )
  })

  it('rejects avatar upload without file', async () => {
    const { accessToken } = await createUserWithTokens()

    const response = await api(accessToken)
      .patch('/api/auth/avatar')
      .expect(400)

    expect(response.body.error).toBe('Avatar file is required')
  })

  it('returns 502 when cloudinary upload fails', async () => {
    vi.mocked(uploadAvatar).mockRejectedValueOnce(new Error('CDN down'))

    const { accessToken } = await createUserWithTokens()

    const response = await api(accessToken)
      .patch('/api/auth/avatar')
      .attach('avatar', Buffer.from('fake-image-content'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(502)

    expect(response.body.error).toBe('Avatar upload failed')
  })
})
