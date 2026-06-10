import { describe, expect, it } from 'vitest'

import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'
import { expectValidationError } from '../../helpers/validation.js'

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const { credentials } = await createUserWithTokens()

    const response = await api()
      .post('/api/auth/login')
      .send({
        username: credentials.username,
        password: credentials.password,
      })
      .expect(200)

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        username: credentials.username,
        email: credentials.email,
      },
    })
  })

  it('rejects login with invalid password', async () => {
    const { credentials } = await createUserWithTokens()

    const response = await api()
      .post('/api/auth/login')
      .send({
        username: credentials.username,
        password: 'wrongpassword',
      })
      .expect(401)

    expect(response.body.error).toBe('Invalid credentials')
  })

  it('rejects login for unknown user', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({
        username: 'unknown_user',
        password: 'securepass123',
      })
      .expect(401)

    expect(response.body.error).toBe('Invalid credentials')
  })

  it('rejects missing login fields', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({ username: 'only_username' })
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.body.keys).toContain('password')
  })
})
