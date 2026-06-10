import bcrypt from 'bcrypt'
import createHttpError from 'http-errors'

import prisma from '../../prisma/client.js'
import { uploadAvatar } from '../services/cloudinary.js'
import { createTokens, setRefreshTokenCookie } from '../services/auth.js'

export const register = async (req, res) => {
  const { username, email, password, name } = req.body

  req.log.info({ username, email }, 'User registration requested')

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  })

  if (existingUser) {
    req.log.warn(
      { username, email, existingUserId: existingUser.id },
      'User registration rejected: username or email already taken',
    )
    throw createHttpError(409, 'Username or email already taken')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
    },
  })

  const tokens = await createTokens(user.id)
  setRefreshTokenCookie(res, tokens.refreshToken)

  req.log.info({ userId: user.id, username: user.username }, 'User registered')

  res.status(201).json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  })
}

export const login = async (req, res) => {
  const { username, password } = req.body

  req.log.info({ username }, 'User login requested')

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    req.log.warn({ username }, 'User login rejected: user not found')
    throw createHttpError(401, 'Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    req.log.warn({ userId: user.id, username }, 'User login rejected: invalid password')
    throw createHttpError(401, 'Invalid credentials')
  }

  const tokens = await createTokens(user.id)
  setRefreshTokenCookie(res, tokens.refreshToken)

  req.log.info({ userId: user.id, username: user.username }, 'User logged in')

  res.status(200).json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  })
}

export const updateAvatar = async (req, res) => {
  const userId = Number(req.user.sub)

  if (!req.file) {
    req.log.warn({ userId }, 'Avatar update rejected: file not provided')
    throw createHttpError(400, 'Avatar file is required')
  }

  req.log.info(
    {
      userId,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
    'Avatar upload requested',
  )

  let uploadedAvatar

  try {
    uploadedAvatar = await uploadAvatar(req.file.buffer, userId)
  } catch (err) {
    req.log.error({ err, userId }, 'Avatar upload to Cloudinary failed')
    throw createHttpError(502, 'Avatar upload failed')
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: uploadedAvatar.secure_url },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      avatar: true,
    },
  })

  req.log.info(
    { userId, cloudinaryPublicId: uploadedAvatar.public_id },
    'User avatar updated',
  )

  res.json({ user })
}

export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!refreshToken) {
    req.log.warn('Token refresh rejected: refresh token not provided')
    throw createHttpError(401, 'Refresh token not provided')
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  })

  if (!storedToken) {
    req.log.warn('Token refresh rejected: refresh token not found')
    throw createHttpError(401, 'Invalid refresh token')
  }

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })
    req.log.warn(
      { userId: storedToken.userId, refreshTokenId: storedToken.id },
      'Token refresh rejected: refresh token expired',
    )
    throw createHttpError(401, 'Refresh token expired')
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } })

  const tokens = await createTokens(storedToken.userId)
  setRefreshTokenCookie(res, tokens.refreshToken)

  req.log.info({ userId: storedToken.userId }, 'Token pair refreshed')

  res.status(200).json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  })
}

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (refreshToken) {
    const result = await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })

    req.log.info({ deletedTokens: result.count }, 'User logged out')
  } else {
    req.log.info('Logout requested without refresh token')
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(204).end()
}
