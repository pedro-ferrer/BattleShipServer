const express = require('express');
const {graphiqlExpress} = require('graphql-server-express');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const graphqlHTTP = require('express-graphql');

mongoose.connect('mongodb+srv://root:root@cluster0-awigs.mongodb.net/test?retryWrites=true');
mongoose.connection.once('open', () => {
    console.log('Connected to database.');
})

const PORT = 4000;
const server = express();

server.use(cors());

server.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
  }));

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
}));

// Wrap the Express server
const ws = createServer(server);
ws.listen(PORT, () => {
  console.log(`Apollo Server is now running on http://localhost:${PORT}`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  });
});