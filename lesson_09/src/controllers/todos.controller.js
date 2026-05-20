import prisma from '../../prisma/client.js'

export const getAllTodos = async (req, res, next) => {
  const { page, limit, completed, search, sortBy, sortOrder } = req.query
  const skip = (page - 1) * limit
  const where = {}

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
  const todo = await prisma.todo.create({
    data: req.body,
  })

  res.status(201).json(todo)
}

export const getTodoById = async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  })

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' })
  }

  return res.json(todo)
}

export const updateTodo = async (req, res, next) => {
  const todo = await prisma.todo.update({
    where: { id: req.params.id },
    data: req.body,
  })

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' })
  }

  return res.json(todo)
}

export const deleteTodo = async (req, res, next) => {
  await prisma.todo.delete({ where: { id: req.params.id } })

  return res.status(204).send()
}
