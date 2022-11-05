import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
  PublishCommandOutput,
  MessageAttributeValue
} from '@aws-sdk/client-sns'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput
} from '@aws-sdk/lib-dynamodb'
import { customAlphabet } from 'nanoid'

const REGION = 'ap-southeast-2'
const snsClient = new SNSClient({ region: REGION })
const ddbClient = new DynamoDBClient({ region: REGION })
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)

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

interface DDBPutInput {
  TableName: string
  Item: Record<string, any>
}

export const ddbPut = async (input: DDBPutInput): Promise<PutCommandOutput> => {
  const { TableName, Item } = input
  const params: PutCommandInput = {
    TableName,
    Item
  }
  const data = await ddbDocClient.send(new PutCommand(params))
  return data
}

interface DDBGetInput {
  TableName: string
  Key: Record<string, any>
}

export const ddbGet = async (input: DDBGetInput): Promise<GetCommandOutput> => {
  const { TableName, Key } = input
  const params: GetCommandInput = {
    TableName,
    Key
  }
  const data = await ddbDocClient.send(new GetCommand(params))
  return data
}

interface DDBQueryInput {
  TableName: string
  IndexName?: string
  KeyConditionExpression: string
  ExpressionAttributeValues: Record<string, any>
  ExpressionAttributeNames?: Record<string, string>
}

export const ddbQuery = async (
  input: DDBQueryInput
): Promise<QueryCommandOutput> => {
  const {
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeValues
  } = input
  const params: QueryCommandInput = {
    TableName,
    IndexName,
    KeyConditionExpression,
    ExpressionAttributeValues
  }
  const data = await ddbDocClient.send(new QueryCommand(params))
  return data
}

export const nanoid = customAlphabet('1234567890cfe', 10)
