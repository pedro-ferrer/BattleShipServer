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
const Player = require("../models/player");
const CurrentGame = require("../models/currentGame");

/* Subscription Constants */
const PLAYER_CREATED= "PLAYER_CREATED";
const CURRENT_GAME_CREATED= "CURRENT_GAME_CREATED";
/*                        */

var PlayerType = new GraphQLObjectType({
  name: "Player",
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
    currentTurn: {
      type: PlayerType,
      resolve(parent, args) {
        return Player.findById(parent.currentTurn);
      }
    }
  })
});

/************************** Querys, Mutations, Subscriptions *****************************/

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getPlayerById: {
      type: PlayerType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Player.findById(args.id);
      }
    },
    getAllPlayers: {
      type: GraphQLList(PlayerType),
      args: {},
      resolve(parent, args) {
        return Player.find({});
      }
    },
    getAllCurrentGames: {
      type: GraphQLList(CurrentGameType),
      args: {},
      resolve(parent, args) {
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
    getAllCurrentGameByPlayer: {
      type: GraphQLList(CurrentGameType),
      args: { idPlayer: { type: GraphQLID } },
      resolve(parent, args) {
        return CurrentGame.find({currentTurn : args.idPlayer});
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createPlayer: {
      type: PlayerType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args) {
        let player = new Player({
          name: args.name
        });
        const playerSaved = player.save();
        pubsub.publish(PLAYER_CREATED, { playerCreated: player });
        return playerSaved;
      }
    },
    createCurrentGame: {
      type: CurrentGameType,
      args: {
        playerId: { type: GraphQLString}
      },
      resolve(parent, args) {
        let currentGame = new CurrentGame({
          createdAt: new Date(),
          timePlayed: 0,
          currentTurn: args.playerId
        });
        currentGame.save(function(err, doc, numbersAffected) {
          if(err){
            console.log('There was an error on save CurrentGame', e.message);
          }else{
            pubsub.publish(CURRENT_GAME_CREATED, {currentGames: CurrentGame.find({currentTurn : args.playerId})});
          }
        });
        return currentGame;
      }
    },
    deleteAllCurrentGames:{
      type: CurrentGameType,
      args: {
      },
      resolve(parent, args) {
        return CurrentGame.deleteMany().exec();
      }
    }
  }
});

const Subscription = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    playerCreated: {
      type: PlayerType,
      subscribe: () => pubsub.asyncIterator(PLAYER_CREATED)
    },
    currentGames:{
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
