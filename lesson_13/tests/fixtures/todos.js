import { api } from '../helpers/api.js'

export const createTodo = async (token, overrides = {}) => {
  const response = await api(token)
    .post('/api/todos')
    .send({ title: 'Default todo', ...overrides })
    .expect(201)

  return response.body
}

export const createTodos = async (token, items) => {
  const todos = []

  for (const item of items) {
    todos.push(await createTodo(token, item))
  }

  return todos
}
