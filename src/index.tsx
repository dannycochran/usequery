import React from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/graphql"
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  }
});

// Removing "requestDetails" from here will make the React warnings go away.
const GET_MOVIES = gql(`
query GetMovies($movieIds: [Int!]!) {
  movies(movieIds: $movieIds) {
    movieId
    internalTitle
  }
}
`);

function FooBarPage() {
  return <div>
    <h1>Foobar Route</h1>
    <Link to={'/'}>Click me to go back to home and see the query re-fire</Link>
  </div>
}

function HomePage() {
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: { movieIds: [80117456, 80025678] }
  });
  return (
    <div>
      <h1>Home Page Route</h1>
      <Link to={'/foobar'}>Click me to unmount to another route</Link>
      {(() => {
        if (loading) {
          return <div>loading (we only want to see this on first mount)...</div>
        }
        <ul>
          {data.movies.map((movie: any) => {
            return <div key={movie.movieId}>
              <div>{movie.internalTitle}</div>
            </div>;
          })}
        </ul>
      })()}
    </div>
  );
}

function App() {
  return <ApolloProvider client={client}>
    <BrowserRouter>
      <Switch>
        <Route exact path={'/'} component={HomePage} />
        <Route exact path={'/foobar'} component={FooBarPage} />
      </Switch>
    </BrowserRouter>
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
