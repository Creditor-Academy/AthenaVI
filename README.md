# Athena VI Frontend

React + Vite frontend for the Athena VI video creation platform. Includes the video editor (Remotion), team workspaces, HeyGen avatar/voice integration, and an admin portal.

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `VITE_API_BASE_URL` to your backend URL (no trailing slash).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

In development, `/api` requests are proxied to `VITE_API_BASE_URL` (defaults to `http://localhost:9000` when unset).

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL. Required at **build time** for production so API calls resolve correctly. |

## Deployment

- **Docker:** Multi-stage build in `Dockerfile` (Node build → nginx serve).
- **CI/CD:** Jenkins pipeline in `Jenkinsfile` (build, SonarQube scan, Docker image to ECR).

Set `VITE_API_BASE_URL` in your deployment environment before running `npm run build`.
