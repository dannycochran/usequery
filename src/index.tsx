import React from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import {
  useQuery,
  ApolloProvider as ApolloHooksProvider
} from "@apollo/react-hooks";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/graphql"
  })
});

// Removing "requestDetails" from here will make the React warnings go away.
const GET_MOVIES = gql(`
query GetMovies($movieIds: [Int!]!) {
  movies(movieIds: $movieIds) {
    movieId
    internalTitle
  }
  requestDetails {
      id
  }
}
`);

const collections = Object.values({
    "161e2aec-99cd-45ba-90f7-cbe1449ddc06": {
      "movieIds": [
        70000794,
        80117456
      ]
    },
    "e644ab32-4ae4-4bd2-8117-7a2bccf2fb0d": {
      "movieIds": [
        80117715
      ]
    },
    "44b68af6-9436-4111-9a5f-c8a79b4dca58": {
      "movieIds": [
        80117456
      ]
    },
    "e128a262-036d-4133-bb20-834b07800a56": {
      "movieIds": [
        80117456,
        80025678
      ]
    },
    "c91bae38-82d1-4e7e-85d7-bb12bf643f73": {
      "movieIds": [
        80077209
      ]
    },
    "365906b8-5a8a-4769-b185-abd162e685b1": {
      "movieIds": [
        81023181
      ]
    },
    "19096da2-2138-4724-a141-0d4bf803d1dd": {
      "movieIds": [
        81023035
      ]
    },
    "73f6d28b-bfe7-44bf-91d4-452410137618": {
      "movieIds": [
        81023035
      ]
    },
    "8e09c04e-a0e0-46c9-bcaa-c377a8146163": {
      "movieIds": [
        81023035
      ]
    },
    "7985704a-3b4a-4739-a814-e0513246ccd3": {
      "movieIds": [
        81023035
      ]
    }
  });

function CollectionDetails(props: { movieIds: number[] }) {
    const { data } = useQuery(GET_MOVIES, {
        variables: { movieIds: props.movieIds },
        skip: false,
      });
    return <p>{JSON.stringify(data)}</p>
}

function CollectionInfo(props: { collection: (typeof collections)[0] }) {
  const { loading } = useQuery(GET_MOVIES, {
    variables: { movieIds: props.collection.movieIds },
    skip: false,
  })
  // Removing this check will make the React warnings go away.
  if (loading) {
      return <p>loading</p>;
  }
  return <div>
      <CollectionDetails movieIds={props.collection.movieIds} />
      </div>;
}

function Collections() {
  return (
    <ul>
      {collections.map((collection, index) => {
          return <div key={index}>
              <CollectionInfo collection={collection} />
              </div>;
      })}
    </ul>
  );
}

ReactDOM.render(
  <ApolloHooksProvider client={client}>
    <Collections />
  </ApolloHooksProvider>,
  document.getElementById("root")
);
