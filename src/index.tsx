import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { BrowserRouter, Route, Switch, useHistory, useParams } from 'react-router-dom';

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery} from "@apollo/client";
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/graphql"
  }),
  defaultOptions: {
    watchQuery: {
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
    },
  },
});

const GET_MOVIE = gql(`
query GetMovie($movieId: ID!) {
  movie(movieId: $movieId) {
    movieId
    internalTitle
  }
}
`);

function HomePage() {
  const { movieId } = useParams() as { movieId?: string };
  const { data, error } = useQuery(GET_MOVIE, {
    variables: {
      movieId
    },
    skip: !movieId,
  });

  console.log('home page rendering', movieId, error);
  const history = useHistory();
  const onNavigateToValidRoute = useCallback(()=> {
    history.push('/80057281');
  }, [history]);

  const onNavigateHome = useCallback(()=> {
    history.push('/');
  }, [history]);

  if (!movieId) {
    return <div>
    <h1>Home Page -- No Movie ID in URL</h1>
    <button onClick={onNavigateToValidRoute}>Click me to navigate to a valid movie id where the error will persist.</button>
  </div>
  }

  return <div>
    <h1>Movie Detail Page</h1>
    <button onClick={onNavigateHome}>Click me to navigate home</button>
    {error && <div>{error.message}</div>}
    {(() => {
      if (!data) {
        return <div>we have no movie...</div>
      }
      return <div key={data.movie.movieId} style={{ display: 'flex', flexDirection: 'row'}}>
        <div>{data.movie.internalTitle}</div>
      </div>
    })()}
  </div>
}
function App() {
  return <ApolloProvider client={client}>
    <BrowserRouter>
      <Switch>
        <Route exact path={'/:movieId?'} component={HomePage} />
      </Switch>
    </BrowserRouter>
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
