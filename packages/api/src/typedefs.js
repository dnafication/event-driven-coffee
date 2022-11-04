export default `#graphql
  type Query {
    getCoffees: [Coffee]

    # admin only
    getOrderList: [OrderDetail]
    getPaymentList: [PaymentDetail]
    getFulfilmentList: [FulfilmentDetail]
  }

  type Mutation {
    orderCoffee(coffeeId: ID!, sizeId: ID!, milkId: ID!): OrderDetail!
    cancelOrder(orderId: ID!): OrderDetail!
    rejectFulfilment(fulfilmentId: ID!): FulfilmentDetail!
    publishOrderStatus(id: ID!, status: String!, note: String!): Boolean!
    publishPaymentStatus(id: ID!, orderId: ID!, status: String!, note: String!): Boolean!
    publishFulfilmentStatus(id: ID!, orderId: ID!, status: String!, note: String!): Boolean!
  }

  type Subscription {
    orderEvents: OrderDetail
    paymentEvents: PaymentDetail
    fulfilmentEvents: FulfilmentDetail
  }

  type Coffee {
    id: ID!
    name: String!
    description: String!
    price: Int! # in cents
  }

  type OrderDetail {
    id: ID!
    coffee: Coffee!
    status: String!
    note: String
  }

  type PaymentDetail {
    id: ID!
    orderId: ID!
    status: String!
    note: String
  }

  type FulfilmentDetail {
    id: ID!
    orderId: ID!
    status: String!
    note: String
  }

`
