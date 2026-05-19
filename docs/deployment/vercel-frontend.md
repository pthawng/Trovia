# Trovia Frontend Vercel Deployment Guide

This guide details the steps required to deploy the Trovia React/TypeScript frontend to **Vercel** with high-performance static asset delivery and dynamic Serverless SSR routing.

---

## 1. Stack Detection & Architecture

Trovia utilizes **TanStack Start (React + TanStack Router + Vite)** for high-performance server-side rendering (SSR) and client-side hydration.

### Build Outputs
When running `pnpm run build`, Vite generates two environments:
1. **Client Assets** (`dist/client`): HTML, CSS, client-side JS bundles, and public media files.
2. **Server Bundle** (`dist/server/server.js`): The unified SSR server entrypoint.

### Vercel Serverless SSR Bridge
Unlike pure Single Page Applications (SPAs) that serve index.html for all routes, Trovia's SSR handles initial render requests dynamically. 
* Static files under `/assets/*` are served instantly from the edge cache.
* All other requests (e.g., `/`, `/login`, `/app/explore`) are rewritten to a Vercel Serverless Function (`api/index.js`) executing on the Node.js runtime, ensuring smooth SEO rendering, instant load times, and dynamic i18n hydration.

---

## 2. Configuration Files

### `vercel.json`
The project's rewrite maps dynamic requests to the Serverless Node.js bridge:

```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/assets/:path*",
      "destination": "/assets/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### `api/index.js`
The bridge handler proxies the standard Vercel `Request` to the SSR server:

```javascript
import server from "../dist/server/server.js";

export default async function handler(request) {
  return server.fetch(request);
}
```

---

## 3. Environment Variables

Create these variables in the **Vercel Project Dashboard** under **Settings > Environment Variables**:

| Variable | Description | Example (Development) | Example (Production) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Backend REST API endpoint | `http://localhost:3001/api` | `https://api.trovia.vn/api` |
| `VITE_SOCKET_URL` | Backend Socket.IO endpoint | `http://localhost:3001` | `https://api.trovia.vn` |
| `VITE_APP_URL` | Absolute URL of the frontend | `http://localhost:8080` | `https://trovia.vn` |

---

## 4. Auth, Cookie & CORS Configuration (Backend Requirements)

To ensure secure cross-domain authentication (frontend on Vercel, backend on an independent server/VPS), the NestJS backend must configure the following security settings:

### CORS Settings
* **`origin`**: Must match the exact Vercel deployment URL (e.g. `https://trovia.vn` or Vercel preview domain `https://trovia-frontend.vercel.app`).
* **`credentials`**: Must be set to `true` (enables transmitting JWT refresh token cookies).

### Cookie Security
For production (HTTPS):
* **`httpOnly`**: `true` (prevents XSS reading the refresh token).
* **`secure`**: `true` (enforces HTTPS delivery).
* **`sameSite`**: `none` (required since the frontend on Vercel is a different top-level domain than the API domain).

---

## 5. Vercel Deployment Steps

Follow these instructions in the Vercel Dashboard:

1. Click **Add New > Project** and import the `trovia-home-hub` repository.
2. In the **Framework Preset**, choose **Other** (do not select Vite or React since TanStack Start uses a custom SSR server layout).
3. Set the **Root Directory** to `frontend`.
4. Under **Build and Development Settings**:
   * **Build Command**: `pnpm run build`
   * **Install Command**: `pnpm install`
   * **Output Directory**: Leave empty/default (Vercel will build both static files and the `/api` function automatically).
5. Add the **Environment Variables** detailed in Section 3.
6. Click **Deploy**.

---

## 6. Post-Deployment Verification Checklist

After the deployment finishes, verify that each of the following components is operational:

- [ ] **Home Page Loading**: Visit `https://YOUR_VERCEL_DOMAIN/` — ensure the hero illustration, search widgets, and features load instantly.
- [ ] **Clean Routing Refresh**: Navigate to `/login` or `/about` and hit browser refresh (F5). The page must reload cleanly without showing Vercel's default 404 block.
- [ ] **Real Properties Fetching**: Verify the listing grid on the landing page does not show mock entries, but displays a premium loading skeleton and correctly pulls live rooms once backend is active.
- [ ] **Dynamic Hero Search Redirect**: Type a keyword in the landing search and click **Tìm phòng trọ** — verify you are redirected to the Login page with a search query callback if unauthenticated.
- [ ] **Socket.IO Reconnection**: Log in, open developer console, and confirm no localhost websocket connections are failing. Connections must use the secure production socket endpoint with automatic reconnection capability.
- [ ] **Custom 404 Route**: Try entering a non-existent URL (e.g. `/app/non-existent-page`) and verify the custom premium Vietnamese 404 page is rendered with a functional home redirect button.
