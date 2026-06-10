import request from 'supertest'

import app from '../../app.js'
import { authHeader } from './auth.js'

const withAuth = (req, token) => (token ? req.set(authHeader(token)) : req)

export const api = (token = null) => {
  const agent = request(app)

  return {
    get: (url) => withAuth(agent.get(url), token),
    post: (url) => withAuth(agent.post(url), token),
    patch: (url) => withAuth(agent.patch(url), token),
    delete: (url) => withAuth(agent.delete(url), token),
  }
}
