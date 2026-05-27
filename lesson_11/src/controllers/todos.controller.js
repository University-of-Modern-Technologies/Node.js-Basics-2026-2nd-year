import createHttpError from 'http-errors'

import prisma from '../../prisma/client.js'

export const getAllTodos = async (req, res) => {
  const { page, limit, completed, search, sortBy, sortOrder } = req.query
  const skip = (page - 1) * limit
  const where = {
    userId: Number(req.user.sub),
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

  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      completed,
      userId: Number(req.user.sub),
    },
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  res.status(201).json(todo)
}

export const getTodoById = async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  if (!todo) {
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== Number(req.user.sub)) {
    throw createHttpError(403, 'You can only view your own todos')
  }

  res.json(todo)
}

export const updateTodo = async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  })

  if (!todo) {
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== Number(req.user.sub)) {
    throw createHttpError(403, 'You can only edit your own todos')
  }

  const updated = await prisma.todo.update({
    where: { id: req.params.id },
    data: req.body,
    include: {
      user: { select: { id: true, username: true, name: true } },
    },
  })

  res.json(updated)
}

export const deleteTodo = async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  })

  if (!todo) {
    throw createHttpError(404, 'Todo not found')
  }

  if (todo.userId !== Number(req.user.sub)) {
    throw createHttpError(403, 'You can only delete your own todos')
  }

  await prisma.todo.delete({ where: { id: req.params.id } })

  res.status(204).end()
}
