import 'dotenv/config'
import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { errors as celebrateErrors } from 'celebrate'

import logger from './src/logger.js'
import authRouter from './src/routes/auth.js'
import healthRouter from './src/routes/health.js'
import todoRouter from './src/routes/todos.routers.js'

const app = express()

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TODO API',
      version: '1.0.0',
      description: 'REST API for TODO with JWT authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://my-app.example.com'],
    allowedHeaders: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  }),
)
app.use(helmet({ contentSecurityPolicy: false })) // Disable CSP for development, adjust for production as needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
})

app.use(pinoHttp({ logger }))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', authRouter)
app.use('/api/health', healthRouter)
app.use('/api/todos', todoRouter)

app.get('/', (req, res) => {
  res.send({ message: 'Hello World!' })
})

app.use(celebrateErrors({ statusCode: 422 })) // { statusCode: 422 }

// 404 Not Found handler - must be after all routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handling middleware
app.use((err, req, res, _next) => {
  req.log.error({ err }, 'Request failed')

  // JSON parsing errors (invalid JSON format)
  if (err.type === 'entity.parse.failed' && err.status === 400) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON',
      validation: {
        body: {
          source: 'body',
          keys: [],
          message: 'Invalid JSON format in request body',
        },
      },
    })
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Avatar file is too large' })
    }

    return res.status(422).json({ error: err.message })
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' })
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint failed' })
  }

  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      docsUrl: `http://localhost:${PORT}/api-docs`,
    },
    'Server started',
  )
})
