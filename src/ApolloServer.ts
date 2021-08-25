import { createError, useBody, useQuery } from "h3";
import { IncomingMessage, ServerResponse } from "http";
import { ApolloServerBase, GraphQLOptions, convertNodeHttpToRequest, runHttpQuery } from "apollo-server-core";

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(request?: IncomingMessage, reply?: ServerResponse): Promise<GraphQLOptions> {
    return this.graphQLServerOptions({ request, reply });
  }
  async handle(req: IncomingMessage, res: ServerResponse) {
    const { graphqlResponse, responseInit } = await runHttpQuery([], {
      method: req.method || 'GET',
      options: () => this.createGraphQLServerOptions(req, res),
      query: req.method === "POST" ? await useBody(req) : await useQuery(req),
      request: convertNodeHttpToRequest(req),
    });
    if (responseInit.headers) {
      for (const [name, value] of Object.entries<string>(responseInit.headers)) {
        res.setHeader(name, value);
      }
    }
    if (responseInit.status || 200 !== 200) {
      throw createError({ statusCode: responseInit.status });
    }

    return graphqlResponse;
  }
}
