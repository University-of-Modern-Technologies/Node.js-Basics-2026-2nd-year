import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

const authenticate = (req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return next(createHttpError(401, 'Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return next(createHttpError(401, 'Invalid or expired token'))
  }
}

export default authenticate
