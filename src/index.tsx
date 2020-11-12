import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";

import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache({
    // typePolicies: {
    //   // Query: {
    //   //   movies: {
          
    //   //   },
    //   // },
    //   Movie: {
    //     fields: {
    //       artworks: {
    //         merge: (
    //           existing,
    //           incoming,
    //         ) => {
    //           return existing ?? incoming;
    //         },
    //       }
    //     }
    //   }
    // }
  }),
  link: new HttpLink({
    uri: "/graphql"
  }),
});

// Removing "requestDetails" from here will make the React warnings go away.
const GET_MOVIES = gql(`
query GetMovies($filters: Filters) {
  movies {
    id
    internalTitle
    artworks(filters: $filters) {
      id
      name
      language
      type
    }
  }
}
`);

const languageOptions = ['en', 'de', 'es', 'ko', 'ja', 'it'];
const imageTypeOptions = ['wide', 'tall', 'billboard', 'screen', 'mobile'];

function HomePage() {
  const [languages, setLanguages] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const { data, loading } = useQuery(GET_MOVIES, {
    variables: {
      filters: {
        languages,
        types,
      }
    },
    notifyOnNetworkStatusChange: true,
  });

  const languagesSet = new Set(languages);
  const typesSet = new Set(types);

  const onClickLanguage = useCallback((language: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setLanguages([
        ...languages,
        language,
      ])
    } else {
      const index = languages.indexOf(language);
      const newLanguages = [...languages];
      newLanguages.splice(index, 1);
      setLanguages(newLanguages);
    }
  }, [languages]);

  const onClickType = useCallback((type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setTypes([
        ...types,
        type,
      ])
    } else {
      const index = types.indexOf(type);
      const newTypes = [...types];
      newTypes.splice(index, 1);
      setTypes(newTypes);
    }
  }, [types]);

  return (
    <div>
      <h1>Home Page</h1>
      {(() => {
        if (loading) {
          return <div>loading</div>
        }
        return <div style={{ display: 'flex', flexDirection: 'column', flex: 1}}>
          <ul style={{ display: 'flex', flexDirection: 'row', flex: 1}}>
            {languageOptions.map(language => {
              return <div key={language} style={{ marginRight: 10 }}>
                <label>{language}</label>
                <br />
                <input type='checkbox' checked={languagesSet.has(language)} value={language} onChange={onClickLanguage(language)} />
              </div>;
            })}
          </ul>
          <ul style={{ display: 'flex', flexDirection: 'row', flex: 1}}>
            {imageTypeOptions.map(type => {
              return <div key={type} style={{ marginRight: 10 }}>
                <label>{type}</label>
                <br />
                <input type='checkbox' checked={typesSet.has(type)} value={type} onChange={onClickType(type)} />
              </div>;
            })}
          </ul>
          <ul>
            {data.movies.map((movie: any) => {
              return <div key={movie.id} style={{ marginBottom: 10 }}>
                <h4>{movie.internalTitle}</h4>
                <div>
                  {movie.artworks.map((artwork: any) => {
                    return <div key={artwork.id}>
                      <div>{artwork.name}</div>
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

function App() {
  return <ApolloProvider client={client}>
    <HomePage />
  </ApolloProvider>
}

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
