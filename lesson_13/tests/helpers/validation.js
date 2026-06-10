import { expect } from 'vitest'

export const expectValidationError = (response) => {
  expect(response.body).toMatchObject({
    statusCode: 422,
    error: 'Unprocessable Entity',
    message: 'Validation failed',
  })
  expect(response.body.validation).toBeDefined()
}
