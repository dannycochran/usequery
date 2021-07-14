## Duplicating

```sh
npm install
npm run start
```

1. Navigate to localhost:3000/124891248912491
2. Notice that you will see an error from "useQuery", this is expected.
3. Click the button to return home where there is no movie query parameter.
4. Click the button to navigate to valid movie.
5. Note a flicker where the error message will temporarily render, and note in the console that the error is still present from the "useQuery" return value.
6. The error then disappears once the fetch is complete. However, since the variable set is distinct at the point of #4, the "useQuery" state should be empty and there should be no cached value for this query yet.