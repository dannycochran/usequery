
## Description

This is a simple Create React App demonstrating a bug with Apollo's "useQuery" with the new version of React 16.3.0.

## Duplicating

```sh
npm install
npm run start
```

Then, open the developer tools window and you'll see the warning:

```
5index.js:1 Warning: Cannot update a component from inside the function body of a different component.
    in CollectionDetails (at src/index.tsx:104)
    in div (at src/index.tsx:103)
    in CollectionInfo (at src/index.tsx:113)
    in div (at src/index.tsx:112)
    in ul (at src/index.tsx:110)
    in Collections (at src/index.tsx:122)
    in ApolloProvider (at src/index.tsx:121)
```

There are a number of ways to make this error disappear:

1. Remove the "if (loading)" check on line 100 in src/index.tsx.
2. remove the part of the query for "requestDetails"
3. reduce the number of collection items in that hard coded object.

I don't know why these solutions work, I'm pretty baffled at the cause of this error.