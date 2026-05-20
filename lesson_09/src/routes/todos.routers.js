import express from 'express'
import * as todosController from '../controllers/todos.controller.js'
import {
  validateCreateTodo,
  validateTodoId,
  validateTodosQuery,
  validateUpdateTodo,
} from '../validators/todos.validator.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo REST API
 *
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Learn REST API
 *         description:
 *           type: string
 *           nullable: true
 *           example: Practice Express and Prisma
 *         completed:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTodoInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Learn REST API
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           example: Practice Express and Prisma
 *         completed:
 *           type: boolean
 *           example: false
 *     UpdateTodoInput:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Learn Swagger
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 255
 *           example: Add OpenAPI comments
 *         completed:
 *           type: boolean
 *           example: true
 *     TodosListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Todo'
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Not found
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get todos
 *     description: Returns todos with pagination, filtering, search, and sorting.
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of todos per page.
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter todos by completion status.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search todos by title or description.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, title, completed, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field used for sorting.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting direction.
 *     responses:
 *       200:
 *         description: Todos list.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodosListResponse'
 *       422:
 *         description: Validation error.
 */
router.get('/', validateTodosQuery, todosController.getAllTodos)

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoInput'
 *     responses:
 *       201:
 *         description: Todo created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid JSON body.
 *       422:
 *         description: Validation error.
 */
router.post('/', validateCreateTodo, todosController.createTodo)

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo id.
 *     responses:
 *       200:
 *         description: Todo found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       422:
 *         description: Validation error.
 */
router.get('/:id', validateTodoId, todosController.getTodoById)

/**
 * @swagger
 * /api/todos/{id}:
 *   patch:
 *     summary: Update todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoInput'
 *     responses:
 *       200:
 *         description: Todo updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error.
 */
router.patch('/:id', validateUpdateTodo, todosController.updateTodo)

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Todo id.
 *     responses:
 *       204:
 *         description: Todo deleted.
 *       404:
 *         description: Todo not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error.
 */
router.delete('/:id', validateTodoId, todosController.deleteTodo)

export default router
