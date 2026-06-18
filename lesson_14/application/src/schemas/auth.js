import { celebrate, Joi, Segments } from "celebrate";

const credentialsSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

export const registerValidation = celebrate({
  [Segments.BODY]: credentialsSchema,
});

export const loginValidation = celebrate({
  [Segments.BODY]: credentialsSchema,
});
