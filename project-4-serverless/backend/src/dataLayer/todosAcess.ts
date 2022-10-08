import * as AWS from 'aws-sdk'
import 'source-map-support/register'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosByUserIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async todoItemExists(userId: string, todoId: string): Promise<boolean> {
    const item = await this.getTodoItem(userId, todoId)
    return !!item
  }

  async getTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info(`Fetching all todos for user ${userId} from ${this.todosTable}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosByUserIndex,
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    logger.info(
      `Found ${items.length} todos for user with id: ${userId} in ${this.todosTable}`
    )

    return items as TodoItem[]
  }

  async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
    logger.info(`Fetching todo with id: ${todoId} from ${this.todosTable}`)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()

    const item = result.Item

    return item as TodoItem
  }

  async createTodoItem(todoItem: TodoItem) {
    logger.info(
      `Creating todo with id: ${todoItem.todoId} in ${this.todosTable}`
    )

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
  }

  async updateTodoItem(userId: string, todoId: string, todoUpdate: TodoUpdate) {
    logger.info(`Updating todo item with id: ${todoId} in ${this.todosTable}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()
  }

  async deleteTodoItem(userId: string, todoId: string) {
    logger.info(`Deleting todo item with id: ${todoId} from ${this.todosTable}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()
  }

  async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
    logger.info(
      `Updating attachment URL for todo with id: ${todoId} in ${this.todosTable}`
    )

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}
