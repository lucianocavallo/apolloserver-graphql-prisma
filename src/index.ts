import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

import resolvers from './resolvers';
import app from './server';

const httpServer = http.createServer(app);
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');
const orm = new PrismaClient();

const port = process.env.PORT || 3001;

!(async function () {
  //Same ApolloServer initialization as before, plus the drain plugin
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return { orm, user: req.user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // introspection: false,
  });

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,
    // By default, Apollo-server hosts its GraphQL endpoint at the serverroot. However, *other* Apollo Server Packages hosts it at / graphql. Optionally provide this to match apollo-server.
    path: '/graphql',
  });

  // Modified server startup
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
})();
