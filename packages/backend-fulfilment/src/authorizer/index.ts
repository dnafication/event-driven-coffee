import { APIGatewayTokenAuthorizerEvent, Context } from 'aws-lambda'

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context
) => {
  console.log('event:', event)
  const { authorizationToken } = event
  const SECRET = 'secret'

  if (!authorizationToken || authorizationToken !== SECRET) {
    return {
      principalId: '000',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
  return {
    principalId: '000',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }
      ]
    },
    context: {
      additionalInfo: 'coming from gql'
    }
  }
}
