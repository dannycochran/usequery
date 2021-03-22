const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { v4 } = require('uuid');

const simpleSchema = gql`
    type Query {
        movies(movieIds: [String!]!): [Movie!]!
        tags(movieId: String): [Tag!]!
    }

    type Mutation {
        addTagsToMovie(movieId: String, tagIds: [String!]): Movie!
        removeTagsFromMovie(movieId: String, tagIds: [String!]): Movie!
    }

    type Tag {
        id: String!
        name: String!
    }

    type Details {
        id: String!
        tags: [Tag!]!
    }

    type DetailsWrapper {
        description: String!
        details: Details!
    }

    type Movie {
        id: String!
        internalTitle: String!
        detailWrappers: [DetailsWrapper!]!
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
        detailWrappers: [{
            description: 'Simple detail wrapper',
            details: {
                id: 'details-1',
                tags: Object.values(fakeTags),
            }
        }]
    },
};

const server = new ApolloServer({
    typeDefs: simpleSchema.loc.source.body,
    resolvers: {
        Query: {
            movies: (root, args, context, info) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(args.movieIds.map(movieId => fakeMovies[movieId]));
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
                    movie.detailWrappers[0].details.tags.push(fakeTags[tagId]);
                });
                movie.detailWrappers[0].details.tags = Array.from(new Set(movie.detailWrappers[0].details.tags));
                console.log('pushed', movie, args.tagIds, movie.detailWrappers[0].details);
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(fakeMovies[args.movieId]);
                    }, 100);
                });
            },
            removeTagsFromMovie: (root, args, context, info) => {
                const movie = fakeMovies[args.movieId];
                args.tagIds.forEach(tagId => {
                    const tagIndex = movie.detailWrappers[0].details.tags.findIndex(tag => tag.id === tagId);
                    if (tagIndex !== -1) {
                        movie.detailWrappers[0].details.tags.splice(tagIndex, 1);
                    }
                });
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(fakeMovies[args.movieId]);
                    }, 100);
                });
            }
        }
    }
});
const app = express();
server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, 'localhost', () => console.log(`🚀 Server ready at http://localhost:4000`));
