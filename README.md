## Duplicating

```sh
npm install
npm run start
```

1. Delete any movie
2. Observe that the mutation succeeds
3. Observe that the refetch queries succeeds to the server
4. observe that in the new route, we are reading from cache and forcing continuous updates but we are reading stale cache results each time.
5. observe that refreshing back to the home route shows the movie is gone.