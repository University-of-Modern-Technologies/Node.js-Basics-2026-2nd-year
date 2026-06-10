import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

const authenticate = (req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    req.log.warn('Authentication rejected: token not provided')
    return next(createHttpError(401, 'Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    req.log.warn('Authentication rejected: invalid or expired token')
    return next(createHttpError(401, 'Invalid or expired token'))
  }
}

export default authenticate
