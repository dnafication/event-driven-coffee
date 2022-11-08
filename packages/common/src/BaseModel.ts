import {
  PutCommand,
  PutCommandInput,
  GetCommand,
  GetCommandInput,
  QueryCommand,
  QueryCommandInput
} from '@aws-sdk/lib-dynamodb'
import { ddbDocClient } from './'

export class BaseModel {
  id: string
  createdAt: number
  date: string
  source: string // set by the subclass. example: 'order-service', 'payment-service' etc
  ddbTableName: string

  constructor(ddbTableName: string, id: string) {
    this.id = id
    this.ddbTableName = ddbTableName
    this.createdAt = new Date().getTime()
    this.date = new Date().toISOString().split('T')[0]
  }

  async save() {
    // save self to db
    const input: PutCommandInput = {
      TableName: this.ddbTableName,
      Item: this
    }

    await ddbDocClient.send(new PutCommand(input))
    console.log(`Saved item to db: ${this.id}, ${this.ddbTableName}`)
    await this.load()
  }

  async load() {
    // get self from db
    const input: GetCommandInput = {
      TableName: this.ddbTableName,
      Key: {
        id: this.id
      }
    }

    const ddbGet = await ddbDocClient.send(new GetCommand(input))
    if (ddbGet.Item) {
      Object.assign(this, ddbGet.Item)
    }
    console.log(`Item loaded from db: ${this.id}, ${this.ddbTableName}`)
  }

  static async query(input: QueryCommandInput) {
    // query db
    const ddbQuery = await ddbDocClient.send(new QueryCommand(input))
    return ddbQuery.Items
  }
}
