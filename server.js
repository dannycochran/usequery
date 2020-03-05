
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { v4 } = require('uuid');

const simpleSchema = gql`
    type Query {
        movies(movieIds: [Int!]): [Movie!]!
        requestDetails: RequestDetails!
    }

    type Movie {
        movieId: Int!
        internalTitle: String!
    }

    type RequestDetails {
        id: String!
    }
`;

const fakeMovies = {
    80117715: {
        movieId: 80117715,
        internalTitle: 'some movie 80117715',
    },
    80057281: {
        movieId: 80057281,
        internalTitle: 'some movie 80057281',
    },
    80117456: {
        movieId: 80117456,
        internalTitle: 'some movie 80117456',
    },
    80229867: {
        movieId: 80229867,
        internalTitle: 'some movie 80229867',
    },
    80025678: {
        movieId: 80229867,
        internalTitle: 'some movie 80229867',
    },
    80229865:{
        movieId: 80229865,
        internalTitle: 'some movie 80229865',
    },
    81023035:{
        movieId: 81023035,
        internalTitle: 'some movie 81023035',
    },
    80077209: {
        movieId: 80077209,
        internalTitle: 'some movie 80077209',
    },
    81023174: {
        movieId: 81023174,
        internalTitle: 'some movie 81023174',
    },
    81023181:{
        movieId: 81023181,
        internalTitle: 'some movie 81023181',
    },
    70000794:{
        movieId: 70000794,
        internalTitle: 'some movie 70000794',
    },
};

const server = new ApolloServer({
    typeDefs: simpleSchema.loc.source.body,
    resolvers: {
        Query: {
            movies: (root, args, context, info) => {
                const movieIds = args.movieIds;
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(movieIds.map(movieId => fakeMovies[movieId]));
                    }, 2000);
                });
            },
            requestDetails: (root, args, context, info) => {
                return { id: v4() };
            }
        },
    }
});
const app = express();
server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, 'localhost', () => console.log(`🚀 Server ready at http://localhost:4000`));
