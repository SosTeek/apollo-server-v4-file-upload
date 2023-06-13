import 'colors';
import { ApolloServer, BaseContext } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginInlineTrace } from "@apollo/server/plugin/inlineTrace";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import loglevel from "loglevel";
import { GraphQLFormattedError } from "graphql";
import http, { IncomingMessage } from "http";
import { configs } from "./configs";
import { schema } from "./graphql/schema";
import { EnvironmentEnum } from "./enums";

import { graphqlUploadExpress } from "graphql-upload";

class Server {
  expressApp: express.Application;
  logger: loglevel.Logger;

  constructor() {
    this.expressApp = express();
    this.logger = loglevel.getLogger("apollo-server");
  }

  public async start() {
    this.configuration();
    this.logger.setLevel(
      configs.node_env === EnvironmentEnum.production
        ? loglevel.levels.INFO
        : loglevel.levels.DEBUG
    );

    const httpServer = http.createServer(this.expressApp);

    const server = new ApolloServer<BaseContext>({
      schema: schema,
      introspection: true,
      csrfPrevention: false,
      includeStacktraceInErrorResponses: true,
      cache: "bounded",
      formatError: (formattedError: GraphQLFormattedError) => {
        if (
          formattedError.extensions?.code ===
          ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
        ) {
          return {
            ...formattedError,
            message:
              "Your query doesn't match the schema. Try double-checking it!",
          };
        }
        return formattedError;
      },
      plugins: [
        ApolloServerPluginCacheControl({
          defaultMaxAge: 1,
          calculateHttpHeaders: false,
        }),
        configs.node_env === EnvironmentEnum.production
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault(),
        ApolloServerPluginInlineTrace({
          includeErrors: { transform: (error : any) => error },
        }),
      ],
    });

    await server.start();

    this.expressApp.use(
      "/",
      cors<cors.CorsRequest>({ origin: 'localhost:4000' }),
      bodyParser.json(),
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
      expressMiddleware(server, {
        context: async ({ req }: {
          req: IncomingMessage;
        }): Promise<any> => {
          const token = req.headers.authorization as string;
          const secret = req.headers?.["x-workspace-secret-id"] as string;
          return { req }
        },
      })
    );
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));

    await new Promise<void>((resolve) => {
      const port = this.expressApp.get("port");
      httpServer.listen({ port: port }, resolve);
      console.log('🚀 Apollo server running at'.blue, `http://localhost:${this.expressApp.get('port')}/`.blue.bold);
    });
  }

  private configuration(): void {
    this.expressApp.set("port", configs.port);
  }
}

const server = new Server();
server.start().catch(error => { console.log('ROOT ERROR', error) });
