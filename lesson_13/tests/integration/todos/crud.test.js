import { beforeEach, describe, expect, it } from 'vitest'

import { createTodo } from '../../fixtures/todos.js'
import { createUserWithTokens } from '../../fixtures/users.js'
import { api } from '../../helpers/api.js'
import { expectValidationError } from '../../helpers/validation.js'

describe('Todos CRUD', () => {
  let accessToken

  beforeEach(async () => {
    ;({ accessToken } = await createUserWithTokens())
  })

  describe('POST /api/todos', () => {
    it('creates a todo', async () => {
      const response = await api(accessToken)
        .post('/api/todos')
        .send({
          title: 'Learn REST API',
          description: 'Practice Express and Prisma',
          completed: false,
        })
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: 'Learn REST API',
        description: 'Practice Express and Prisma',
        completed: false,
        userId: expect.any(Number),
      })
    })

    it('rejects create without title', async () => {
      const response = await api(accessToken)
        .post('/api/todos')
        .send({ description: 'No title here' })
        .expect(422)

      expectValidationError(response)
      expect(response.body.validation.body.keys).toContain('title')
    })

    it('rejects too long title', async () => {
      const response = await api(accessToken)
        .post('/api/todos')
        .send({ title: 'a'.repeat(101) })
        .expect(422)

      expectValidationError(response)
      expect(response.body.validation.body.keys).toContain('title')
    })

    it('rejects invalid JSON body', async () => {
      const response = await api(accessToken)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400)

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid JSON',
      })
    })
  })

  describe('GET /api/todos/:id', () => {
    it('gets todo by id', async () => {
      const todo = await createTodo(accessToken, { title: 'Read docs' })

      const response = await api(accessToken)
        .get(`/api/todos/${todo.id}`)
        .expect(200)

      expect(response.body.title).toBe('Read docs')
    })

    it('rejects non-numeric todo id', async () => {
      const response = await api(accessToken).get('/api/todos/abc').expect(422)

      expectValidationError(response)
      expect(response.body.validation.params.keys).toContain('id')
    })
  })

  describe('PATCH /api/todos/:id', () => {
    it('updates a todo', async () => {
      const todo = await createTodo(accessToken, { title: 'Old title' })

      const response = await api(accessToken)
        .patch(`/api/todos/${todo.id}`)
        .send({ title: 'New title', completed: true })
        .expect(200)

      expect(response.body).toMatchObject({
        title: 'New title',
        completed: true,
      })
    })

    it('rejects empty update body', async () => {
      const todo = await createTodo(accessToken, { title: 'Valid todo' })

      const response = await api(accessToken)
        .patch(`/api/todos/${todo.id}`)
        .send({})
        .expect(422)

      expectValidationError(response)
    })
  })

  describe('DELETE /api/todos/:id', () => {
    it('deletes a todo', async () => {
      const todo = await createTodo(accessToken, { title: 'To delete' })

      await api(accessToken).delete(`/api/todos/${todo.id}`).expect(204)

      await api(accessToken).get(`/api/todos/${todo.id}`).expect(404)
    })
  })
})
