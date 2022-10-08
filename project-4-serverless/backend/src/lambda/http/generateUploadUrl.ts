import 'source-map-support/register'
import * as uuid from 'uuid'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import { generateUploadUrl, updateAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Generate UploadUrl event', { event })

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const attachmentId = uuid.v4()

  const uploadUrl = await generateUploadUrl(attachmentId)

  await updateAttachmentUrl(userId, todoId, attachmentId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
      
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
