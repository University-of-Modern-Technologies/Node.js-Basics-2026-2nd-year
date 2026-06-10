import { beforeEach, describe, expect, it } from 'vitest'

import { createTodo } from '../../fixtures/todos.js'
import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'

describe('Todos authorization', () => {
  let accessToken

  beforeEach(async () => {
    ;({ accessToken } = await createUserWithTokens())
  })

  describe('missing todo', () => {
    it.each([
      [
        'GET',
        (token) => api(token).get('/api/todos/9999'),
        'Todo not found',
      ],
      [
        'PATCH',
        (token) =>
          api(token).patch('/api/todos/9999').send({ title: 'New title' }),
        'Todo not found',
      ],
      [
        'DELETE',
        (token) => api(token).delete('/api/todos/9999'),
        'Todo not found',
      ],
    ])('%s returns 404 for missing todo', async (_, makeRequest, error) => {
      const response = await makeRequest(accessToken).expect(404)

      expect(response.body.error).toBe(error)
    })
  })

  describe('another user todo', () => {
    it.each([
      [
        'GET',
        (token, id) => api(token).get(`/api/todos/${id}`),
        'You can only view your own todos',
      ],
      [
        'PATCH',
        (token, id) =>
          api(token).patch(`/api/todos/${id}`).send({ title: 'Hacked title' }),
        'You can only edit your own todos',
      ],
      [
        'DELETE',
        (token, id) => api(token).delete(`/api/todos/${id}`),
        'You can only delete your own todos',
      ],
    ])(
      '%s returns 403 for another user todo',
      async (_, makeRequest, error) => {
        const todo = await createTodo(accessToken, { title: 'Private todo' })
        const { accessToken: otherAccessToken } = await createUserWithTokens()

        const response = await makeRequest(otherAccessToken, todo.id).expect(403)

        expect(response.body.error).toBe(error)
      },
    )
  })
})
