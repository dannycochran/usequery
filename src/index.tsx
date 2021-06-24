import React from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery} from "@apollo/client";
import { useEffect } from "react";
import { useState } from "react";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/graphql"
  }),
});

const GET_MOVIES = gql(`
query GetMovies($movieIds: [Int!]!) {
  movies(movieIds: $movieIds) {
    movieId
    internalTitle
  }
}
`);

const AUTH_WINDOW_ID = 'oauth_auth_only_window';

const openWindowForAuth = () =>
  new Promise<void>((resolve, reject) => {
    try {
      localStorage.setItem(AUTH_WINDOW_ID, 'true');
      const clearAuthWindowHook = () => {
        localStorage.removeItem(AUTH_WINDOW_ID);
        window.removeEventListener('beforeunload', clearAuthWindowHook);
      };
      window.addEventListener('beforeunload', clearAuthWindowHook);

      const loginWindow = window.open(`/?${AUTH_WINDOW_ID}=${Date.now()}`);

      let pollSeconds = 0;
      const poll = () => {
        if (loginWindow?.closed) {
          clearAuthWindowHook();
          resolve();
        } else if (pollSeconds++ > 5 * 60) {
          clearAuthWindowHook();
          reject(new Error('TIMEOUT'));
        } else setTimeout(poll, 1000);
      };
      poll();
    } catch (e) {
      reject(e);
    }
  });

const closeWindowIfOpenedForAuth = () => {
  if (window.location.href.includes(AUTH_WINDOW_ID) || localStorage.getItem(AUTH_WINDOW_ID)) {
    localStorage.removeItem(AUTH_WINDOW_ID);
    window.close();
  }
};
closeWindowIfOpenedForAuth();

/**
 * This causes bugs with React 16.14.0, but works fine in React 17.0.1
 */
const RandomComponentThatUpdatesState = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fruits, setFruits] = useState<any>();
  useEffect(() => {
    setFruits({ bananas: 1 });
  }, [])

  return null;
};

function HomePage() {
  useQuery(GET_MOVIES, {
    variables: { movieIds: [80117456, 80025678] }
  });
  return (
    <div>
      <h1>Home Page Route</h1>
      <button onClick={() => openWindowForAuth()}>Sign in and out</button>
      <RandomComponentThatUpdatesState />
    </div>
  );
}

function App() {
  return <ApolloProvider client={client}>
    <HomePage />
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
