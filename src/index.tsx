import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { createClient, ApolloClient, ApolloProvider, InMemoryCache, useMutation, useQuery } from "@studio-ui-common/studio-graphql-client";
import { persistenceLink } from '@studio-ui-common/studio-graphql-client/links/persistence';

const createStudioGraphqlClient = () => {
  return createClient({
    uri: '/graphql',
    defaultOptions: {
      watchQuery: {
        persistFetchPolicyState: true,
        // Read from persisted cache at first when opening app, but kick off a network
        // request to get updated data.
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
        // refetchWritePolicy: 'overwrite',
      },
    },
    namedLinks: {
      corsLink: false,
      persistenceLink,
    }
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


const REMOVE_TAGS = gql(`
mutation RemoveTagFromMovie($movieId: String!, $tagIds: [String!]!) {
  removeTagsFromMovie(movieId: $movieId, tagIds: $tagIds)
}
`);

function HomePage() {
  const [movieIds] = useState<string[]>(['1']);
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: {
      movieIds,
    },
  });
  const [removeTagFromMovie] = useMutation(REMOVE_TAGS, {
    refetchQueries: ['GetMovies'],
  });

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
            {data?.movies.map((movie: any) => {
              const tags = movie.tags;
              const sortedMovieTags = [...tags].sort((tagA: any, tagB: any) => {
                return tagA.name.localeCompare(tagB.name);
              });
              return <div key={movie.id} style={{ marginBottom: 10 }}>
                <h4>{movie.internalTitle}</h4>
                <div style={{ fontWeight: 'bold' }}>add more tags (remove a tag to add)</div>

                <div style={{ marginBottom: 50, width: '100%' }} />
                <div style={{ fontWeight: 'bold' }}>movie tags</div>
                <div>
                  {sortedMovieTags.map((tag: any) => {
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
  const [homeMounted, setHomeMounted] = useState(true);
  const onUnmountHomePage = useCallback(() => {
    setHomeMounted(!homeMounted);
  }, [homeMounted]);
  return <ApolloProvider client={client}>
    <button onClick={onUnmountHomePage}>unmount home</button>
    {homeMounted && <HomePage />}
  </ApolloProvider>
}

const renderReactApp = () => {
  ReactDOM.render(
    <App client={createStudioGraphqlClient()} />,
    document.getElementById("root")
  );  
};

renderReactApp();