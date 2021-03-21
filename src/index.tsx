import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery, useMutation} from "@apollo/client";
import { LocalStorageWrapper, persistCache } from "apollo3-cache-persist";


const createClient = async () => {
  const cache = new InMemoryCache({
    typePolicies: {
      Movie: {
        fields: {
          tags: {
            merge: (existing, incoming, { mergeObjects }) => {
              return incoming ?? existing;
            }
          }
        }
      }
    }
  });
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
  })
  return new ApolloClient({
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy(lastFetchPolicy) {
          if (lastFetchPolicy === 'cache-and-network' || lastFetchPolicy === 'network-only') {
            return 'cache-first';
          }
          return lastFetchPolicy;
        },

        // By default, mutation calls to `refetchQueries` do not trigger re-renders, e.g.
        // the loading state would be silent. We don't want that. We want loading states.
        notifyOnNetworkStatusChange: true,
      },
    },
    cache,
    link: new HttpLink({
      uri: "/graphql"
    }),
  });
};

const GET_MOVIES = gql(`
query GetMovies($movieIds: [String!]!) {
  movies(movieIds: $movieIds) {
    id
    internalTitle
    tags {
      id
      name
    }
  }
}
`);

const ADD_TAGS = gql(`
mutation AddTagToMovie($movieId: String!, $tagIds: [String!]!) {
  addTagsToMovie(movieId: $movieId, tagIds: $tagIds) {
    id
  }
}
`);

const REMOVE_TAGS = gql(`
mutation RemoveTagFromMovie($movieId: String!, $tagIds: [String!]!) {
  removeTagsFromMovie(movieId: $movieId, tagIds: $tagIds) {
    id
  }
}
`);

function HomePage() {
  const [movieIds, setMovieIds] = useState<string[]>(['1']);
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: {
      movieIds,
    },
  });
  const [addTagToMovie] = useMutation(ADD_TAGS, {
    refetchQueries: ['GetMovies'],
  });
  const [removeTagFromMovie] = useMutation(REMOVE_TAGS, {
    refetchQueries: ['GetMovies'],
  });

  const onClickAddTags = useCallback(async (movieId: string, tagIds: string[]) => {
    try {
      await addTagToMovie({ variables: { movieId, tagIds }});
    } catch (err) {
      console.warn(`failed to add tag to ${movieId}`);
    }
  }, [removeTagFromMovie]);

  const onClickRemoveTags = useCallback(async (movieId: string, tagIds: string[]) => {
    try {
      await removeTagFromMovie({ variables: { movieId, tagIds }});
    } catch (err) {
      console.warn(`failed to remove tag from ${movieId}`);
    }
  }, [removeTagFromMovie]);

  return (
    <div>
      <h1>Home Page</h1>
      {(() => {
        if (loading) {
          return <div>loading</div>
        }
        return <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
          <ul>
            {data.movies.map((movie: any) => {
              const hasTag1 = movie.tags.find((t: any) => t.id === 'tag-1');
              const hasTag2 = movie.tags.find((t: any) => t.id === 'tag-2');
              const hasTag3 = movie.tags.find((t: any) => t.id === 'tag-3');
              const hasTag4 = movie.tags.find((t: any) => t.id === 'tag-4');
              const sortedTags = [...movie.tags].sort((tagA: any, tagB: any) => {
                return tagA.name.localeCompare(tagB.name);
              });
              return <div key={movie.id} style={{ marginBottom: 10 }}>
                <h4>{movie.internalTitle}</h4>
                <div style={{ fontWeight: 'bold' }}>add more tags (remove a tag to add)</div>

                <button disabled={hasTag3 || hasTag4} onClick={() => onClickAddTags(movie.id, ['tag-3', 'tag-4'])}>Add tag 3 and 4 at once</button>
                <button disabled={hasTag1} onClick={() => onClickAddTags(movie.id, ['tag-1'])}>Add tag 1</button>
                <button disabled={hasTag2} onClick={() => onClickAddTags(movie.id, ['tag-2'])}>Add tag 2</button>
                <button disabled={hasTag3} onClick={() => onClickAddTags(movie.id, ['tag-3'])}>Add tag 3</button>
                <button disabled={hasTag4} onClick={() => onClickAddTags(movie.id, ['tag-4'])}>Add tag 4</button>

                <div style={{ marginBottom: 50, width: '100%' }} />
                <div style={{ fontWeight: 'bold' }}>movie tags</div>
                <div>
                  {sortedTags.map((tag: any) => {
                    return <div key={tag.id}>
                      <div>{tag.name}</div>
                      <button onClick={() => onClickRemoveTags(movie.id, [tag.id])}>remove tag</button>
                    </div>
                  })}
                </div>
              </div>;
            })}
          </ul>
        </div>
      })()}
    </div>
  );
}

function App({ client }: { client: ApolloClient<any> }) {
  return <ApolloProvider client={client}>
    <HomePage />
  </ApolloProvider>
}

const renderReactApp = async () => {
  const client = await createClient();
  ReactDOM.render(
    <App client={client} />,
    document.getElementById("root")
  );  
};

renderReactApp();