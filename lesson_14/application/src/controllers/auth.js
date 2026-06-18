import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'
import prisma from '../../prisma/client.js'
import { createSession, deleteSession, findValidSession } from '../services/session.js'

const COOKIE_NAME = 'sessionId'
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7 // 1 week

export const register = async (req, res) => {
  const { username, password } = req.body

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    throw createHttpError(409, 'Користувач з таким іменем уже існує')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, passwordHash },
  })

  const session = await createSession(user.id)

  res.cookie(COOKIE_NAME, session.id, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  res.status(201).json({ id: user.id, username: user.username })
}

export const login = async (req, res) => {
  const { username, password } = req.body

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    throw createHttpError(401, 'Невірний логін або пароль')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw createHttpError(401, 'Невірний логін або пароль')
  }

  const session = await createSession(user.id)

  res.cookie(COOKIE_NAME, session.id, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  res.json({ id: user.id, username: user.username })
}

export const logout = async (req, res) => {
  const sessionId = req.cookies[COOKIE_NAME]
  if (sessionId) {
    await deleteSession(sessionId)
    res.clearCookie(COOKIE_NAME)
  }
  res.status(204).send()
}

export const me = async (req, res) => {
  const sessionId = req.cookies[COOKIE_NAME]
  if (!sessionId) {
    return res.status(401).send('Не авторизовано')
  }

  const session = await findValidSession(sessionId)
  if (!session || !session.user) {
    return res.status(401).send('Сесія недійсна')
  }

  res.json({ id: session.user.id, username: session.user.username })
}
