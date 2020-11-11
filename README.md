
## Description

This is a simple Create React App demonstrating a bug (or potentially expected behavior) where unmounting a component that
has a "fetchPolicy" of "cache-and-network" and "nextFetchPolicy" of "cache-first" essentially resets the fetchPolicy state,
such that returning to the component utilizes the "fetchPolicy" rather than the "nextFetchPolicy", which means the query will
re-fire even though the data exists in cache.

The way I work around this is wrapping my useQuery utilization and keeping a global tracker of whether the query has been run
once. If it has, I force the fetchPolicy to be "cache-first", this feels like a hack and I wonder if this behavior is expected
or is a bug w/Apollo.

## Duplicating

```sh
npm install
npm run start
```

1. Click "Click me to unmount to another route"
2. Click "Click me to go back to home and see the query re-fire"
3. You'll see the "loading.." indicator, which indicates the query has re-fired.