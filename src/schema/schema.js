import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
} from "graphql/type";
import { PubSub } from "apollo-server";
import { GraphQLScalarType } from "graphql";

const pubsub = new PubSub();
const { makeExecutableSchema } = require("graphql-tools");
const User = require("../models/user");
const CurrentGame = require("../models/currentGame");

/* Subscription Constants */
const USER_CREATED= "USER_CREATED";
const CURRENT_GAME_CREATED= "CURRENT_GAME_CREATED";
/*                        */

var UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString }
  })
});

var CurrentGameType = new GraphQLObjectType({
  name: "CurrentGame",
  fields: () => ({
    id: { type: GraphQLID },
    createdAt: { type: DateTime },
    timePlayed: { type: GraphQLInt },
    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.user);
      }
    }
  })
});

/************************** Querys, Mutations, Subscriptions *****************************/

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getUserById: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      }
    },
    getAllUsers: {
      type: GraphQLList(UserType),
      args: {},
      resolve(parent, args) {
        return User.find({});
      }
    },
    getAllCurrentGames: {
      type: GraphQLList(CurrentGameType),
      args: {},
      resolve(parent, args) {
        CurrentGame.deleteMany().exec();
        User.deleteMany().exec();
        return CurrentGame.find({});
      }
    },
    getCurrentGameById: {
      type: CurrentGameType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return CurrentGame.findById(args.id);
      }
    },
    getAllCurrentGameByUser: {
      type: GraphQLList(CurrentGameType),
      args: { idUser: { type: GraphQLID } },
      resolve(parent, args) {
        return CurrentGame.findBy(args.idUser);
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args) {
        let user = new User({
          name: args.name
        });
        pubsub.publish(USER_CREATED, { userCreated: user });
        return user.save();
      }
    },
    createCurrentGame: {
      type: CurrentGameType,
      args: {
        timePlayed: { type: GraphQLInt },
        userId: { type: GraphQLString}
      },
      resolve(parent, args) {
        let currentGame = new CurrentGame({
          createdAt: new Date(),
          timePlayed: args.timePlayed,
          user: args.userId
        });
        pubsub.publish(CURRENT_GAME_CREATED, {currentGameCreated: CurrentGame.find({})});
        return currentGame.save();
      }
    }
  }
});

const Subscription = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    userCreated: {
      type: UserType,
      subscribe: () => pubsub.asyncIterator(USER_CREATED)
    },
    currentGameCreated:{
      type: GraphQLList(CurrentGameType),
      subscribe: () => pubsub.asyncIterator(CURRENT_GAME_CREATED)
    }
  }
});

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "Date custom scalar type",
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.kind); // ast value is always in string format
    }
    return null;
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
  subscription: Subscription
});
export default schema;
