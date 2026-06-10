import { describe, expect, it } from 'vitest'

import { validUser } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'
import { expectValidationError } from '../../helpers/validation.js'

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const userData = validUser()

    const response = await api()
      .post('/api/auth/register')
      .send(userData)
      .expect(201)

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: expect.any(Number),
        username: userData.username,
        email: userData.email,
        name: userData.name,
        avatar: null,
      },
    })
    expect(response.body.user).not.toHaveProperty('password')
  })

  it('rejects duplicate registration', async () => {
    const userData = validUser()
    await api().post('/api/auth/register').send(userData).expect(201)

    const response = await api()
      .post('/api/auth/register')
      .send(userData)
      .expect(409)

    expect(response.body.error).toBe('Username or email already taken')
  })

  it('rejects short password', async () => {
    const response = await api()
      .post('/api/auth/register')
      .send(validUser({ password: 'short' }))
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.body.keys).toContain('password')
  })

  it('rejects invalid email', async () => {
    const response = await api()
      .post('/api/auth/register')
      .send(validUser({ email: 'not-an-email' }))
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.body.keys).toContain('email')
  })

  it('rejects invalid username characters', async () => {
    const response = await api()
      .post('/api/auth/register')
      .send(validUser({ username: 'user@name' }))
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.body.keys).toContain('username')
  })
})
