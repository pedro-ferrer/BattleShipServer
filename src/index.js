const express = require('express');
const graphqlHTTP = require ('express-graphql');
const app = express();
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb+srv://root:root@cluster0-awigs.mongodb.net/test?retryWrites=true');
mongoose.connection.once('open',()=>{
    console.log('Connected to database.');
})
app.use('/graphql', graphqlHTTP({
   schema: schema,
   graphiql: true
}));

app.listen(4000, () => {
    console.log('now listening for requests on port 4000')
});