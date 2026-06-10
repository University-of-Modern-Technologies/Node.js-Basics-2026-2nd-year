import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Application status endpoints
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check application status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Application is running
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Application is running',
  })
})

export default router
