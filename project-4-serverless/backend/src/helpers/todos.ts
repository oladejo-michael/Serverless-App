import 'source-map-support/register'
import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic
const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new AttachmentUtils()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })
  return todosAccess.getTodoItems(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }
  logger.info(`Creating todo ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoItem: newItem
  })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  logger.info(`Updating todo ${todoId} for user ${userId}`, {
    userId,
    todoId,
    todoUpdate: updateTodoRequest
  })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} is not permitted to update todo ${todoId}`)
    throw new Error('User does not have the required authourization') // FIXME: 403?
  }

  todosAccess.updateTodoItem(userId, todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todo ${todoId} for the user with id:  ${userId}`, {
    userId,
    todoId
  })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `The user with ${userId} does not have the required permission to delete todo ${todoId}`
    )
    throw new Error('This user is not authorized to delete item') // FIXME: 403?
  }

  todosAccess.deleteTodoItem(userId, todoId)
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
) {
  logger.info(`Generating attachment URL for attachment ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

  logger.info(
    `Updating todo ${todoId} with the attachment URL ${attachmentUrl}`,
    { userId, todoId }
  )

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item) throw new Error('Item not found') // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(
      `The user with id ${userId} does not have the required permission to update todo ${todoId}`
    )
    throw new Error('The user is not authorized to update item') // FIXME: 403?
  }

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`Generating upload URL for attachment ${attachmentId}`)

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  return uploadUrl
}
