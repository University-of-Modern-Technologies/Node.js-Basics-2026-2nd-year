import app from './app.js'
import logger from './src/logger.js'

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
