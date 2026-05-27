import { celebrate, Joi, Segments } from 'celebrate'

export const validateRegister = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(1).max(100).required(),
  }).required(),
})

export const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).required(),
})
