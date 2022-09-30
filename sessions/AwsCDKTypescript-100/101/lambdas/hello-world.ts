import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const environmentName = process.env.ENV_NAME

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
        const method = event.requestContext.http.method
        const path = event.requestContext.http.path
        const forwardedForHeader = (event.headers || {})["X-Forwarded-For"] || event.requestContext.http.sourceIp
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

        // Only accept GET for now.
        return {
            statusCode: 400,
            headers: {},
            body: `We only accept GET / <br>received event ${JSON.stringify(event)}`
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(JSON.stringify(error, null, 2))
        }
    }
}
