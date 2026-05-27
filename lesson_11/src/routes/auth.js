import { Router } from 'express'

import { login, logout, refresh, register } from '../controllers/auth.js'
import { validateLogin, validateRegister } from '../validators/auth.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 *
 * components:
 *   schemas:
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: dev_user
 *         email:
 *           type: string
 *           format: email
 *           example: dev@example.com
 *         name:
 *           type: string
 *           example: Dev User
 *     AuthTokensResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *     RefreshTokensResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - name
 *       properties:
 *         username:
 *           type: string
 *           example: dev_user
 *         email:
 *           type: string
 *           format: email
 *           example: dev@example.com
 *         password:
 *           type: string
 *           example: securepass123
 *         name:
 *           type: string
 *           example: Dev User
 *     LoginInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: dev_user
 *         password:
 *           type: string
 *           example: securepass123
 *     RefreshInput:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: 8252d3a7b3c2100e52b1ad8ddd72f2839677463f1b441e158a70f7fa5b94c966efbfb78f4e6791a3
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       409:
 *         description: Username or email already taken
 *       422:
 *         description: Validation error
 */
router.post('/register', validateRegister, register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */
router.post('/login', validateLogin, login)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh token pair
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokensResponse'
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refresh)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       204:
 *         description: Logged out successfully
 */
router.post('/logout', logout)

export default router
