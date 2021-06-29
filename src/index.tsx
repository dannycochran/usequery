import React from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery, useMutation} from "@apollo/client";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/graphql"
  }),
});

const GET_MOVIES = gql(`
query GetMovies {
  movies {
    movieId
    internalTitle
  }
}
`);

const DELETE_MOVIE = gql(`
mutation DeleteMovie($movieId: Int!) {
  deleteMovie(movieId: $movieId)
}
`);

function AnotherPageWithMovies() {
  const { data } = useQuery(GET_MOVIES, {
    fetchPolicy: 'cache-only',
    nextFetchPolicy: 'cache-only'
  });

  /**
   * Force re-rendering so we continue to read from cache after the refetchQueries completes, to demonstrate
   * that the cache is not updated.
   */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((prevTick) => prevTick + 1);
    }, 1000);
    return () => {
      window.clearInterval(interval);
    }
  }, []);
  return <div>
    <h1>We switched routes and the movies list did not update, tick {tick}</h1>
    {(() => {
        if (!data) {
          return <div>loading...</div>
        }
        return <ul>
          {data.movies.map((movie: any, index: number) => {
            return <div key={movie.movieId} style={{ display: 'flex', flexDirection: 'row'}}>
              <div>Movie #: {index}</div>
              <div>{movie.internalTitle}</div>
            </div>;
          })}
        </ul>
      })()}
  </div>
}

function HomePageWithMovies() {
  const { data, loading } = useQuery(GET_MOVIES);
  const [deleteMovie] = useMutation(DELETE_MOVIE, {
    refetchQueries: ['GetMovies']
  });
  const history = useHistory();
  const onDeleteMovie = useCallback(async (movieId: number) => {
    await deleteMovie({ variables: { movieId }});
    history.push('/foobar');
  }, [deleteMovie, history])

  return (
    <div>
      <h1>Home Page Route</h1>
      <div>when you delete a movie, we will change routes right after the mutation finishes, but before refetch queries does. the mounted page will have the same list of movies because the cache did not update properly</div>
      {(() => {
        if (loading) {
          return <div>loading...</div>
        }
        return <ul>
          {data.movies.map((movie: any, index: number) => {
            return <div key={movie.movieId} style={{ display: 'flex', flexDirection: 'row'}}>
              <div>Movie #: {index}</div>
              <button onClick={() => onDeleteMovie(movie.movieId)}>delete movie</button>
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
        <Route exact path={'/'} component={HomePageWithMovies} />
        <Route exact path={'/foobar'} component={AnotherPageWithMovies} />
      </Switch>
    </BrowserRouter>
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
