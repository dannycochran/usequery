import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';

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

function AnotherPageWithCorrectAuthorization() {
  const { data, error } = useQuery(GET_MOVIE, {
    variables: {
      movieId: 70000794
    }
  });

  console.log('AnotherPageWithCorrectAuthorization', data, error);
  return <div>
    <h1>We switched routes and we have a valid movie, but we have the existing error from the first invocation of the query with a different variable set</h1>
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

function DefaultPageWithUnauthorizedAccess() {
  const { data, error } = useQuery(GET_MOVIE, {
    variables: {
      // this movie id is invalid, so we expect an error
      movieId: 13412412412414124
    }
  });

  const history = useHistory();
  const onNavigateToValidRoute = useCallback(()=> {
    history.push('/foobar');
  }, [history])

  return <div>
    <h1>We expect an error here because the movie id is invalid...</h1>
    <button onClick={onNavigateToValidRoute}>Click me to goto the other route and the error will show up there as well</button>
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
        <Route exact path={'/'} component={DefaultPageWithUnauthorizedAccess} />
        <Route exact path={'/foobar'} component={AnotherPageWithCorrectAuthorization} />
      </Switch>
    </BrowserRouter>
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
