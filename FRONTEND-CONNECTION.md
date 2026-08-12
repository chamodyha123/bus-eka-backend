# Frontend -> Azure connection fix

The browser errors you saw show two separate frontend configuration problems:

1. Requests were going to the Vercel frontend domain with the Azure hostname as a path.
2. Socket.IO was still trying `ws://localhost:5000` after deployment.

Because the frontend is a separate repository, these two values must be fixed in the **frontend repository**, not the backend repository.

## Vercel environment variables
Set:

```text
NEXT_PUBLIC_API_URL=https://YOUR-APP.azurewebsites.net/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-APP.azurewebsites.net
```

Replace `YOUR-APP` with the exact Azure App Service hostname.

Then redeploy the Vercel frontend.

## Axios
Use the API base URL directly:

```js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
```

Then call:

```js
api.post("/auth/login", data);
api.post("/auth/register", data);
api.get("/admin/stats");
api.get("/routes");
```

Do not prepend the frontend domain or Azure hostname manually.

## Socket.IO
Use:

```js
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  transports: ["websocket", "polling"],
});
```

Do not use:

```js
io("http://localhost:5000");
```

in production.
