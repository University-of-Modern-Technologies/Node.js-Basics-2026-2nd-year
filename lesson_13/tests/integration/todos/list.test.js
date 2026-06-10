import { beforeEach, describe, expect, it } from 'vitest'

import { createTodos } from '../../fixtures/todos.js'
import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'
import { expectValidationError } from '../../helpers/validation.js'

describe('GET /api/todos', () => {
  let accessToken

  beforeEach(async () => {
    ;({ accessToken } = await createUserWithTokens())
  })

  it('rejects request without token', async () => {
    const response = await api().get('/api/todos').expect(401)

    expect(response.body.error).toBe('Authentication required')
  })

  it('returns empty todos list', async () => {
    const response = await api(accessToken).get('/api/todos').expect(200)

    expect(response.body).toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    })
  })

  it('supports pagination', async () => {
    await createTodos(
      accessToken,
      [{ title: 'Todo 1' }, { title: 'Todo 2' }, { title: 'Todo 3' }],
    )

    const response = await api(accessToken)
      .get('/api/todos?page=1&limit=2')
      .expect(200)

    expect(response.body.data).toHaveLength(2)
    expect(response.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    })
  })

  it('filters todos by completed status', async () => {
    await createTodos(accessToken, [
      { title: 'Open todo', completed: false },
      { title: 'Done todo', completed: true },
    ])

    const response = await api(accessToken)
      .get('/api/todos?completed=true')
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].completed).toBe(true)
  })

  it('searches todos by title or description', async () => {
    await createTodos(accessToken, [
      { title: 'Buy milk', description: 'From store' },
      { title: 'Walk dog', description: 'Evening walk' },
    ])

    const response = await api(accessToken)
      .get('/api/todos?search=milk')
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('Buy milk')
  })

  it('rejects limit above maximum', async () => {
    const response = await api(accessToken)
      .get('/api/todos?limit=101')
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.query.keys).toContain('limit')
  })

  it('rejects invalid sortBy value', async () => {
    const response = await api(accessToken)
      .get('/api/todos?sortBy=invalid')
      .expect(422)

    expectValidationError(response)
    expect(response.body.validation.query.keys).toContain('sortBy')
  })
})
