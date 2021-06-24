
## Description

This is a simple Create React App demonstrating a bug where calling window.open and returning to the existing screen, which is
a pattern typically used for re-authenticating, causes a strange bug where the app freezes up and the developer console
is inaccessible.

## Duplicating

```sh
npm install
npm run start
```

1. Open Chrome (not reproducible in Safari) 
2. Click "Sign in and sign out", wait for the window to return.
3. Repeat step 2 until the app is crashed.
