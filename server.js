
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

const simpleSchema = gql`
    type Query {
        movies: [Movie!]!
    }

    type Mutation {
        deleteMovie(movieId: Int!): Boolean!
    }

    type Movie {
        movieId: Int!
        internalTitle: String!
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
        movieId: 80025678,
        internalTitle: 'some movie 80025678',
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
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(Object.values(fakeMovies));
                    }, 2000);
                });
            },
        },
        Mutation: {
            deleteMovie: (root, args, context, info) => {
                delete fakeMovies[args.movieId];
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 100);
                });
            }
        }
    }
});
const app = express();
server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, 'localhost', () => console.log(`🚀 Server ready at http://localhost:4000`));
