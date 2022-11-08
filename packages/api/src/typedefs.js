export default `#graphql
  type Query {
    getCoffees: [Coffee]

    # admin only
    getOrderList(date: String, customerId: String): [OrderDetail]
    getPaymentList(date: String): [PaymentDetail]
    getFulfilmentList(date: String): [FulfilmentDetail]
  }

  type Mutation {
    createOrder(coffeeId: ID!, customerId: String!, customerName: String!): OrderDetail!
    makePayment(orderId: ID!): PaymentDetail!
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
    customerId: String!
    customerName: String!
    coffee: Coffee!
    status: String!
    note: String
    createdAt: Int! # timestamp in seconds
  }

  type PaymentDetail {
    id: ID!
    orderId: ID!
    status: String!
    paymentIntentId: String
    clientSecret: String
    note: String
    createdAt: Int! # timestamp in seconds
  }

  type FulfilmentDetail {
    id: ID!
    orderId: ID!
    status: String!
    note: String
    createdAt: Int! # timestamp in seconds
  }

`
