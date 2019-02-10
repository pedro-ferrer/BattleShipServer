const graphql = require('graphql');
const User = require('../models/user')
const Historical = require('../models/historical')

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull
} = graphql;

const UserType = new GraphQLObjectType({
    name : 'User',
    fields : ()=>({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        historicals : {
            type: new GraphQLList(HistoricalType),
            resolve(parent, args){
                return Historical.find({ userId : parent.id});
            }
        }
    })
});

const HistoricalType = new GraphQLObjectType({
    name : 'Historical',
    fields : ()=>({
        id: { type: GraphQLID },
        // startTime: { type: GraphQLDate },
        // endTime: { type: GraphQLDate },
        turns: { type: GraphQLInt },
        accuracy: { type: GraphQLFloat },
        status: { type: GraphQLBoolean },
        userId: {
            type: UserType,
            resolve(parent, args){
                return User.findById(parent.userId);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields : {
        user: {
            type: UserType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args){
                return User.findById(ags.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                return User.find({});
            }
        },
        historical : {
            type: HistoricalType,
            args: {id:{type:GraphQLID }},
            resolve(parent, args){
                return Historical.findById(args.id)
            }
        },
        historicals : {
            type: new GraphQLList(HistoricalType),
            resolve(parent, args){
                return Historical.find({});
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser:{
            type: UserType,
            args:{
                name : {type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args){
                let user = new User({
                    name : args.name
                });
                return user.save()
            }
        },
        addHistorical:{
            type: HistoricalType,
            args:{
                turns: { type: new GraphQLNonNull(GraphQLInt) },
                accuracy: { type: new GraphQLNonNull(GraphQLFloat) },
                status: { type: new GraphQLNonNull(GraphQLBoolean) },
                userId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                let historical = new Historical({
                    turns: args.turns,
                    accuracy: args.accuracy,
                    status: args.status,
                    userId:args.userId
                });
                return historical.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query : RootQuery,
    mutation : Mutation
})