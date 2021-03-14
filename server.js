const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { v4 } = require('uuid');

const simpleSchema = gql`
    type Query {
        movies(foo: String): [Movie!]!
    }

    type Artwork {
        id: ID!
        name: String!
        type: String!
        language: String!
    }

    type Movie {
        id: ID!
        internalTitle: String!
        artworks(languages: [String!]!): [Artwork!]!
    }
`;

const fakeMovies = {
    '80117715': {
        id: '80117715',
        internalTitle: 'some movie 80117715',
    },
    '80057281': {
        id: '80057281',
        internalTitle: 'some movie 80057281',
    },
    '80117456': {
        id: '80117456',
        internalTitle: 'some movie 80117456',
    },
    '80229867': {
        id: '80229867',
        internalTitle: 'some movie 80229867',
    },
    '80025678': {
        id: '80025678',
        internalTitle: 'some movie 80025678',
    },
    '80229865':{
        id: '80229865',
        internalTitle: 'some movie 80229865',
    },
    '81023035':{
        id: '81023035',
        internalTitle: 'some movie 81023035',
    },
    '80077209': {
        id: '80077209',
        internalTitle: 'some movie 80077209',
    },
    '81023174': {
        id: '81023174',
        internalTitle: 'some movie 81023174',
    },
    '81023181':{
        id: '81023181',
        internalTitle: 'some movie 81023181',
    },
    '70000794':{
        id: '70000794',
        internalTitle: 'some movie 70000794',
    },
};

const languages = ['en', 'de', 'es', 'ko', 'ja', 'it'];
const imageTypes = ['wide', 'tall', 'billboard', 'screen', 'mobile'];
const movieIds = Object.keys(fakeMovies);
for (let i = 0; i < 100; i++) {
    const language = languages[Math.floor(Math.random() * languages.length)];
    const imageType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
    const movieId = movieIds[Math.floor(Math.random() * movieIds.length)];

    const artwork = {
        id: `${Math.random()}-${language}-${imageType}`,
        name: `artwork-${language}-${imageType}`,
        language,
        type: imageType,
    };

    if (!fakeMovies[movieId].artworks) {
        fakeMovies[movieId].artworks = [];
    }
    fakeMovies[movieId].artworks.push(artwork);
}

const server = new ApolloServer({
    typeDefs: simpleSchema.loc.source.body,
    resolvers: {
        Query: {
            movies: (root, args, context, info) => {
                console.log('calling movies resolver');
                const languages = args.languages;
                const languagesSet = new Set(languages);
                const typesSet = new Set();
                return new Promise(resolve => {
                    const movies = Object.values(fakeMovies).map(movie => {
                        const movieToReturn = { ...movie };
                        delete movieToReturn.artworks;
                        return movieToReturn;
                    })
                    setTimeout(() => {
                        resolve(movies)
                    }, 500);
                });
            },
        },
        Movie: {
            artworks: (obj, args) => {
                console.log('calling artworks resolver', obj, args);
                const languages = args.languages;
                const languagesSet = new Set(languages);
                const movie = fakeMovies[obj.id];
                return new Promise(resolve => {
                    const artworks = movie.artworks.filter(artwork => {
                        if (languages.length && !languagesSet.has(artwork.language)) {
                            return false;
                        }
                        return true;
                    });
                    setTimeout(() => {
                        resolve(artworks)
                    }, 500);
                });
            },
        }
    }
});
const app = express();
server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, 'localhost', () => console.log(`🚀 Server ready at http://localhost:4000`));
