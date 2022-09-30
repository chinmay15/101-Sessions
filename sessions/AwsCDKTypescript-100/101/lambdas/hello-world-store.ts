import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

const environmentName = process.env.ENV_NAME
const storeTableName = process.env.STORE_TABLE_NAME || ''
const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
        const method = event.httpMethod
        const path = event.path
        const forwardedForHeader = (event.headers || {})["X-Forwarded-For"] || "not found"
        const sourceIp = forwardedForHeader.split(', ')[0]

        if (method === "GET") {
            if (path === "/") {
                var body = {
                    message: `hello ${sourceIp} from ${environmentName}`
                }
                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body)
                }
            }
        }

        if (method === "POST") {
            const params = {
                TableName: storeTableName,
                Item: {
                    id: `${uuidv4()}`,
                    ipAddress: `${sourceIp}`
                }
            }

            await docClient.put(params).promise()

            var body = {
                message: `Stored ${sourceIp} in ${storeTableName}`
            }
            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify(body)
            }
        }

        // Only accept GET or POST for now.
        return {
            statusCode: 400,
            headers: {},
            body: `We only accept GET or POST / <br>received event ${JSON.stringify(event)}`
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(JSON.stringify(error, null, 2))
        }
    }
}
