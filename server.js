const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { v4 } = require('uuid');

const simpleSchema = gql`
    type Query {
        movie(movieId: String!): Movie!
        tags(movieId: String): [Tag!]!
    }

    type Mutation {
        addTagsToMovie(movieId: String, tagIds: [String!]): Boolean
        removeTagsFromMovie(movieId: String, tagIds: [String!]): Boolean
    }

    type Tag {
        id: String!
        name: String!
    }

    type Movie {
        id: String!
        internalTitle: String!
        tags: [Tag!]!
    }
`;

const fakeTags = {
    'tag-1': {
        id: 'tag-1',
        name: 'tag 1',
    },
    'tag-2': {
        id: 'tag-2',
        name: 'tag 2',
    },
    'tag-3': {
        id: 'tag-3',
        name: 'tag 3',
    },
    'tag-4': {
        id: 'tag-4',
        name: 'tag 4',
    },
};

const fakeMovies = {
    '1': {
        id: '1',
        internalTitle: 'some movie 1',
        tags: Object.values(fakeTags),
    },
};

const server = new ApolloServer({
    typeDefs: simpleSchema.loc.source.body,
    resolvers: {
        Query: {
            movie: (root, args, context, info) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(fakeMovies[args.movieId]);
                    }, 100);
                });
            },
            tags: (root, args, context, info) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(Object.values(fakeTags));
                    }, 100);
                });
            },
        },
        Mutation: {
            addTagsToMovie: (root, args, context, info) => {
                const movie = fakeMovies[args.movieId];
                args.tagIds.forEach(tagId => {
                    movie.tags.push(fakeTags[tagId]);
                });
                movie.tags = Array.from(new Set(movie.tags));
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 100);
                });
            },
            removeTagsFromMovie: (root, args, context, info) => {
                const movie = fakeMovies[args.movieId];
                args.tagIds.forEach(tagId => {
                    const tagIndex = movie.tags.findIndex(tag => tag.id === tagId);
                    if (tagIndex !== -1) {
                        movie.tags.splice(tagIndex, 1);
                    }
                });
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
