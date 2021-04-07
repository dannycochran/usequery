import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { createClient, ApolloClient, ApolloProvider, InMemoryCache, useMutation, useQuery } from "@studio-ui-common/studio-graphql-client";
import { persistenceLink } from '@studio-ui-common/studio-graphql-client/links/persistence';
import { progressFetch } from '@studio-ui-common/studio-graphql-client/helpers/progress-fetch';

const createStudioGraphqlClient = () => {
  return createClient({
    uri: '/graphql',
    progressFetch,
    connectToDevTools: true,
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
    cacheConfig: {
      typePolicies: {

      }
    },
    namedLinks: {
      corsLink: false,
      persistenceLink,
    }
  });
};

const GET_MINIMAL_MOVIE = gql(`
query GetMinimalMovie($movieId: String!) {
  movie(movieId: $movieId) {
    id
    internalTitle
  }
}
`);

const GET_MOVIES = gql(`
query GetMovie($movieId: String!) {
  movie(movieId: $movieId) {
    id
    internalTitle
    tags {
      id
      name
    }
  }
}
`);

const GET_TAGS = gql(`
query GetTags($movieId: String) {
  tags(movieId: $movieId) {
    id
    name
  }
}
`);

const ADD_TAGS = gql(`
mutation AddTagToMovie($movieId: String!, $tagIds: [String!]!) {
  addTagsToMovie(movieId: $movieId, tagIds: $tagIds)
}
`);

const REMOVE_TAGS = gql(`
mutation RemoveTagFromMovie($movieId: String!, $tagIds: [String!]!) {
  removeTagsFromMovie(movieId: $movieId, tagIds: $tagIds)
}
`);

function HomePage() {
  const [movieId] = useState<string>('1');
  const { data: unusedMinimalMovie, loading: loadingMinimalMovie } = useQuery(GET_MINIMAL_MOVIE, {
    variables: {
      movieId,
    },
  });

  if (!unusedMinimalMovie) {
    return null;
  }
  return <MoviePage movieId={movieId} />;
}

function MoviePage(props: { movieId: string }) {
  const { movieId } = props;
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: {
      movieId,
    },
  });
  if (!data) {
    return null;
  }
  return <MovieDetailsPage data={data} loading={loading} movieId={movieId }/>
}

function MovieDetailsPage(props: { movieId: string, data: any, loading: boolean }) {
  const { movieId, data, loading } = props;
  const { data: tagsData, loading: loadingTags } = useQuery(GET_TAGS, {
  });
  const [addTagToMovie] = useMutation(ADD_TAGS, {
    refetchQueries: ['GetMovie'],
  });
  const [removeTagFromMovie] = useMutation(REMOVE_TAGS, {
    refetchQueries: ['GetMovie'],
  });

  const onClickAddTags = useCallback(async (movieId: string, tagIds: string[]) => {
    try {
      await addTagToMovie({ variables: { movieId, tagIds }});
    } catch (err) {
      console.warn(`failed to add tag to ${movieId}`);
    }
  }, [addTagToMovie]);

  const onClickRemoveTags = useCallback(async (movieId: string, tagIds: string[]) => {
    try {
      await removeTagFromMovie({ variables: { movieId, tagIds }});
    } catch (err) {
      console.warn(`failed to remove tag from ${movieId}`);
    }
  }, [removeTagFromMovie]);
  if (!data?.movie) {
    return null;
  }
  const movie = data.movie;
  const tags = movie.tags;
  const allowedTags = [...(tagsData?.tags ?? [])].sort((tagA: any, tagB: any) => {
    return tagA.name.localeCompare(tagB.name);
  });
  const sortedMovieTags = [...tags].sort((tagA: any, tagB: any) => {
    return tagA.name.localeCompare(tagB.name);
  });
  return (
    <div>
      <h1>Home Page</h1>
      {(() => {
        if (loading || loadingTags) {
          return <div>loading</div>
        }
        return <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
          <ul>
            <div key={movie.id} style={{ marginBottom: 10 }}>
              <h4>{movie.internalTitle}</h4>
              <div style={{ fontWeight: 'bold' }}>add more tags (remove a tag to add)</div>


              {allowedTags.map(tag => {
                const hasTag = sortedMovieTags.find((t: any) => t.id === tag.id);
                return <button key={tag.id} disabled={hasTag} onClick={() => onClickAddTags(movie.id, [tag.id])}>Add {tag.name}</button>
              })}

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
            </div>
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

const renderReactApp = () => {
  ReactDOM.render(
    <App client={createStudioGraphqlClient()} />,
    document.getElementById("root")
  );  
};

renderReactApp();