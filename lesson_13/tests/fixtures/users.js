import bcrypt from 'bcrypt'

import prisma from '../../prisma/client.js'
import { createTokens } from '../../src/services/auth.js'

let userCounter = 0

export const validUser = (overrides = {}) => {
  userCounter += 1
  const suffix = `${Date.now()}_${userCounter}_${Math.random().toString(36).slice(2, 8)}`

  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: 'securepass123',
    name: `Test User ${suffix}`,
    ...overrides,
  }
}

export const createUserWithTokens = async (userData = validUser()) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    },
  })

  const tokens = await createTokens(user.id)

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    credentials: userData,
  }
}
