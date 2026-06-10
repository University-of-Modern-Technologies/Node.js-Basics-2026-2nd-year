import createHttpError from 'http-errors'

import prisma from '../../prisma/client.js'

export const getAllTodos = async (req, res) => {
  const { page, limit, completed, search, sortBy, sortOrder } = req.query
  const userId = Number(req.user.sub)
  const skip = (page - 1) * limit
  const where = {
    userId,
  }

  if (completed !== undefined) {
    where.completed = completed
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [todos, total] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, username: true, name: true } },
      },
    }),
    prisma.todo.count({ where }),
  ])

  req.log.debug(
    {
      userId,
      page,
      limit,
      total,
      completed,
      hasSearch: Boolean(search),
      sortBy,
      sortOrder,
    },
    'Todos listed',
  )

  res.json({
    data: todos,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  })
}

export const createTodo = async (req, res) => {
  const { title, description, completed } = req.body
  const userId = Number(req.user.sub)

  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      completed,
      userId,
    },
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  req.log.info({ userId, todoId: todo.id }, 'Todo created')

  res.status(201).json(todo)
}

export const getTodoById = async (req, res) => {
  const userId = Number(req.user.sub)

  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  if (!todo) {
    req.log.warn({ userId, todoId: req.params.id }, 'Todo lookup failed: not found')
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== userId) {
    req.log.warn(
      { userId, todoId: todo.id, ownerId: todo.userId },
      'Todo lookup rejected: forbidden',
    )
    throw createHttpError(403, 'You can only view your own todos')
  }

  req.log.debug({ userId, todoId: todo.id }, 'Todo retrieved')

  res.json(todo)
}

export const updateTodo = async (req, res) => {
  const userId = Number(req.user.sub)

  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  })

  if (!todo) {
    req.log.warn({ userId, todoId: req.params.id }, 'Todo update failed: not found')
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== userId) {
    req.log.warn(
      { userId, todoId: todo.id, ownerId: todo.userId },
      'Todo update rejected: forbidden',
    )
    throw createHttpError(403, 'You can only edit your own todos')
  }

  const updated = await prisma.todo.update({
    where: { id: req.params.id },
    data: req.body,
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  req.log.info(
    { userId, todoId: updated.id, fields: Object.keys(req.body) },
    'Todo updated',
  )

  res.json(updated)
}

export const deleteTodo = async (req, res) => {
  const userId = Number(req.user.sub)

  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  })

  if (!todo) {
    req.log.warn({ userId, todoId: req.params.id }, 'Todo delete failed: not found')
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== userId) {
    req.log.warn(
      { userId, todoId: todo.id, ownerId: todo.userId },
      'Todo delete rejected: forbidden',
    )
    throw createHttpError(403, 'You can only delete your own todos')
  }

  await prisma.todo.delete({ where: { id: req.params.id } })

  req.log.info({ userId, todoId: todo.id }, 'Todo deleted')

  res.status(204).end()
}
