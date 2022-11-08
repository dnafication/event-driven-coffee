import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
  PublishCommandOutput,
  MessageAttributeValue
} from '@aws-sdk/client-sns'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { customAlphabet } from 'nanoid'

const REGION = 'ap-southeast-2'
const snsClient = new SNSClient({ region: REGION })
const ddbClient = new DynamoDBClient({ region: REGION })
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
    convertEmptyValues: true
  }
})

export const errorResponse = (errorMessage, awsRequestId) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId
    }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}

export const successResponse = (body) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}

interface PublishInput {
  MessageGroupId: string
  MessageDeduplicationId: string
  Message: string
  TopicArn: string
  MessageAttributes: Record<string, MessageAttributeValue>
}

export const snsPublish = async (
  input: PublishInput
): Promise<PublishCommandOutput | Error> => {
  const {
    Message,
    MessageAttributes,
    MessageDeduplicationId,
    MessageGroupId,
    TopicArn
  } = input
  const params: PublishCommandInput = {
    Message,
    MessageAttributes,
    MessageDeduplicationId,
    MessageGroupId,
    TopicArn
  }

  const data = await snsClient.send(new PublishCommand(params))
  return data
}

export const nanoid = customAlphabet('1234567890cfe', 10)

export const logger =
  (service: string) =>
  (message: any, ...optionalParameters) => {
    console.log(`[${service}]: ${message}`, ...optionalParameters)
  }
