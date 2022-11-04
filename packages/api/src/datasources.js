import { RESTDataSource } from '@apollo/datasource-rest'

export class OrderAPI extends RESTDataSource {
  constructor() {
    super()
    this.memoizeGetRequests = false
    this.baseURL = process.env.ORDER_API_URL
  }

  async getOrders() {
    return this.get('orders')
  }

  async getCoffees() {
    console.log(`getCoffees: ${this.baseURL}`)
    return this.get('coffees')
  }
}
