import { describe, expect, it } from 'vitest'

import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'

describe('Auth tokens', () => {
  describe('POST /api/auth/refresh', () => {
    it('refreshes token pair', async () => {
      const { refreshToken } = await createUserWithTokens()

      const response = await api()
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(response.body.refreshToken).not.toBe(refreshToken)
    })

    it('rejects invalid refresh token', async () => {
      const response = await api()
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401)

      expect(response.body.error).toBe('Invalid refresh token')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('logs out successfully', async () => {
      const { refreshToken } = await createUserWithTokens()

      await api().post('/api/auth/logout').send({ refreshToken }).expect(204)
    })
  })
})
