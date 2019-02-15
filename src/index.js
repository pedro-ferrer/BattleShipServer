import express from "express";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import schema from "./schema/schema";

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://root:root@cluster0-awigs.mongodb.net/test?retryWrites=true",
  { useNewUrlParser: true }
);
mongoose.connection.once("open", () => {
  console.log("Connected to database.");
});

const PORT = 3030
const server = new ApolloServer({
  schema
});

const app = express();
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port : PORT }, () => {
  console.log("Apollo Server on http://localhost:3030/graphql");
});