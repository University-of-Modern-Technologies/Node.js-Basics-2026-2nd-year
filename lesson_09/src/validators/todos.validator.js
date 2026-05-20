import { celebrate, Joi, Segments } from 'celebrate'

const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 255
const MAX_PAGE_SIZE = 100

const todoIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
})

export const validateTodoId = celebrate({
  [Segments.PARAMS]: todoIdParam,
})

export const validateTodosQuery = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(MAX_PAGE_SIZE).default(10),
    completed: Joi.boolean().optional(),
    search: Joi.string().trim().min(1).max(TITLE_MAX_LENGTH).optional(),
    sortBy: Joi.string()
      .valid('id', 'title', 'completed', 'createdAt', 'updatedAt')
      .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
})

export const validateCreateTodo = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1).max(TITLE_MAX_LENGTH).required(),
    description: Joi.string()
      .max(DESCRIPTION_MAX_LENGTH)
      .allow(null, '')
      .optional(),
    completed: Joi.boolean().optional(),
  }),
})

export const validateUpdateTodo = celebrate({
  [Segments.PARAMS]: todoIdParam,
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1).max(TITLE_MAX_LENGTH).optional(),
    description: Joi.string()
      .max(DESCRIPTION_MAX_LENGTH)
      .allow(null, '')
      .optional(),
    completed: Joi.boolean().optional(),
  }).min(1),
})
