# AthenaVI Frontend — AWS DevOps Guide

This document describes how to build, host, and operate the **AthenaVI frontend** on **AWS**. The app is a **Vite + React single-page application (SPA)** that talks to a separate backend API.

---

## Table of contents

1. [What gets deployed](#1-what-gets-deployed)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Environment variables](#4-environment-variables)
5. [Build process](#5-build-process)
6. [AWS infrastructure setup](#6-aws-infrastructure-setup)
7. [SPA routing and caching](#7-spa-routing-and-caching)
8. [Custom domain and TLS](#8-custom-domain-and-tls)
9. [Backend integration](#9-backend-integration)
10. [CI/CD (GitHub Actions)](#10-cicd-github-actions)
11. [Environments](#11-environments)
12. [Security headers](#12-security-headers)
13. [Operations runbook](#13-operations-runbook)
14. [Troubleshooting](#14-troubleshooting)
15. [Cost overview](#15-cost-overview)
16. [Alternative: AWS Amplify Hosting](#16-alternative-aws-amplify-hosting)

---

## 1. What gets deployed

| Item | Value |
|------|--------|
| **Stack** | React 19, Vite 7, Tailwind CSS |
| **Node version** | `22.22.0` (see `.nvmrc`) |
| **Output** | Static files in `./dist` |
| **Hosting model** | Static site — no Node server in production |
| **API** | External backend; frontend calls it via `VITE_API_BASE_URL` |

**Not included in this frontend deploy:** backend API, databases, HeyGen keys, or S3 buckets used by the API for media/renders. Those are backend concerns (see `api_doc.md`).

---

## 2. Architecture

Recommended production layout:

```text
                    ┌─────────────────┐
  Users ──────────► │   Route 53      │  app.example.com
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │  CDN, HTTPS, SPA fallbacks
                    │   (global)      │  cache /assets/* long-term
                    └────────┬────────┘
                             │ Origin Access Control (OAC)
                    ┌────────▼────────┐
                    │   S3 bucket     │  dist/ artifacts (private)
                    │   (private)     │
                    └─────────────────┘

  Browser ──API calls──► Backend API (ECS, EC2, Render, etc.)
                         e.g. https://api.example.com
```

**Why S3 + CloudFront (not S3 website hosting alone):**

- HTTPS with ACM certificates
- Global CDN and HTTP/2
- Custom security headers
- SPA fallback via CloudFront error pages (cleaner than public S3 website endpoints)
- Private bucket — only CloudFront can read objects

---

## 3. Prerequisites

- AWS account with permissions for S3, CloudFront, ACM, IAM, and (optionally) Route 53
- Backend API deployed and reachable over HTTPS
- Git repository connected to your CI system
- **Node.js 22.22.0** locally or in CI (match `.nvmrc`)

**AWS CLI** (optional but useful):

```bash
aws configure
# or use IAM roles in CI (recommended)
```

---

## 4. Environment variables

Vite embeds env vars at **build time**. They are not changeable after deploy without rebuilding.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | **Yes** (prod) | Backend origin **without** trailing slash, e.g. `https://api.example.com` |
| `NODE_ENV` | Auto | Set to `production` in CI |
| `NODE_VERSION` | Recommended | `22.22.0` in CI to match `.nvmrc` |

**Local development:** `vite.config.js` proxies `/api` to `VITE_API_BASE_URL` or `http://localhost:9000` when unset.

**Production:** `src/config/api.js` prefixes all API paths with `VITE_API_BASE_URL`. If it is empty in production, API calls will fail.

**Backend variables that must reference this frontend** (set on the API server, not in Vite):

| Backend variable | Example | Purpose |
|------------------|---------|---------|
| `FRONTEND_URL` | `https://app.example.com` | OAuth redirect target, email links |
| `OAUTH_SUCCESS_PATH` | `/auth/google/callback` | Google OAuth return path |
| CORS allowed origins | `https://app.example.com` | Browser API access |

---

## 5. Build process

### Install and build

```bash
npm ci
export VITE_API_BASE_URL=https://api.example.com   # Linux/macOS
# set VITE_API_BASE_URL=https://api.example.com    # Windows CMD
npm run build
```

`npm run build` runs:

1. `vite build` — production bundle into `dist/`
2. `node scripts/render-postbuild.mjs` — SPA helpers:
   - `dist/index.html` → `dist/404.html`
   - Copies `index.html` into known client route folders (e.g. `dist/dashboard/index.html`)

The postbuild script mirrors routes from `App.jsx` and improves compatibility when a host serves literal paths. **CloudFront SPA fallback (section 7) is still required** for dynamic paths like `/invitations/accept/<token>`.

### Verify locally

```bash
npm run preview
# open http://localhost:4173
```

### Build checklist

- [ ] `VITE_API_BASE_URL` has **no** trailing slash
- [ ] `dist/assets/` contains hashed JS/CSS
- [ ] `dist/index.html` references `/assets/...` bundles
- [ ] `dist/404.html` exists (postbuild)

---

## 6. AWS infrastructure setup

Replace placeholders:

- `athena-vi-prod` — S3 bucket name (globally unique)
- `E1234567890ABC` — CloudFront distribution ID
- `app.example.com` — your domain

### 6.1 S3 bucket

1. Create bucket `athena-vi-prod` in your preferred region (e.g. `us-east-1`).
2. **Block all public access** — enabled.
3. **Versioning** — optional; useful for rollbacks.
4. **Encryption** — SSE-S3 or SSE-KMS (default is fine for static assets).

Do **not** enable “Static website hosting” when using CloudFront OAC.

### 6.2 CloudFront Origin Access Control (OAC)

1. CloudFront → **Origin access** → create OAC for S3.
2. Attach OAC to the S3 origin.
3. Update the bucket policy so **only** that CloudFront distribution can `s3:GetObject`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::athena-vi-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### 6.3 CloudFront distribution (baseline)

| Setting | Value |
|---------|--------|
| Origin | S3 bucket `athena-vi-prod` |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Default root object | `index.html` |
| Compress objects | Yes |
| Price class | Use all edge locations (or reduce for cost) |

Default cache behavior:

- **Allowed methods:** GET, HEAD, OPTIONS
- **Cache policy:** CachingOptimized (or custom — see section 7)
- **Origin request policy:** CachingS3Origin

### 6.4 IAM deploy role (CI/CD)

Create an IAM role/user for pipelines with least privilege:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::athena-vi-prod"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::athena-vi-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

Store credentials in GitHub Actions secrets or use OIDC (`aws-actions/configure-aws-credentials`).

### 6.5 Manual first deploy

```bash
npm ci
export VITE_API_BASE_URL=https://api.example.com
npm run build

aws s3 sync dist/ s3://athena-vi-prod/ --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "assets/*"

aws s3 sync dist/assets/ s3://athena-vi-prod/assets/ \
  --cache-control "public, max-age=31536000, immutable"

aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

Use separate sync rules so hashed `/assets/*` files get long cache TTLs while `index.html` stays fresh.

---

## 7. SPA routing and caching

React Router paths are handled **client-side**. Direct navigation to e.g. `/dashboard/workspace` must return `index.html`, not S3’s XML 403/404.

### CloudFront custom error responses

Add two custom error responses on the distribution:

| HTTP error | Response page path | Response code |
|------------|-------------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

This covers:

- `/login`, `/signup`, `/dashboard/*`, `/create`
- `/auth/google/callback` (Google OAuth)
- `/invitations/accept/<token>`
- `/reset-password` and other deep links

### Cache behaviors (recommended)

| Path pattern | TTL | Notes |
|--------------|-----|-------|
| `/assets/*` | 1 year, immutable | Vite content-hashed filenames |
| `/*.html`, `/index.html` | 0 or short | Ensures new deploys load quickly |
| Default `*` | Short (e.g. 1 hour) or CachingDisabled for `index.html` only | Balance freshness vs. hits |

After each deploy, **invalidate** `index.html`, `404.html`, and optionally `/*` if you use a single default behavior.

### Important routes (reference)

From `src/App.jsx` — all must resolve to the SPA:

- Auth: `/login`, `/signup`, `/auth/google/callback`
- App: `/dashboard/*`, `/create`, `/download`, `/settings`, `/profile`
- Marketing: `/products`, `/about-us`, `/privacy`, etc.
- Invites: `/invitations/accept/*` (dynamic segment)

---

## 8. Custom domain and TLS

1. **ACM certificate** in **`us-east-1`** (required for CloudFront), e.g. `app.example.com` and `*.example.com` if needed.
2. CloudFront → **Alternate domain names (CNAMEs)** → add `app.example.com`.
3. Attach the ACM certificate to the distribution.
4. **Route 53** (or your DNS provider):
   - Alias A/AAAA record → CloudFront distribution domain name.

Validation: `https://app.example.com` loads the app; `https://app.example.com/dashboard` refreshes without 404.

---

## 9. Backend integration

### CORS

The backend must allow the frontend origin:

```text
https://app.example.com
https://www.app.example.com   # if used
```

Include headers your app sends: `Authorization`, `Content-Type`. For cookie-based refresh (`/api/auth/refresh`), configure `credentials: true` and explicit `Access-Control-Allow-Credentials`.

### Google OAuth flow

1. User clicks “Continue with Google” → browser goes to `{API}/api/auth/google`.
2. After Google auth, backend redirects to:
   ```text
   {FRONTEND_URL}/auth/google/callback#access_token=...
   ```
3. Frontend route `GoogleCallback` reads the hash and stores the token.

**Google Cloud Console:** authorized redirect URI remains on the **backend**, e.g. `https://api.example.com/api/auth/google/callback`.

**Backend env:**

```env
FRONTEND_URL=https://app.example.com
OAUTH_SUCCESS_PATH=/auth/google/callback
```

### Workspace invitations

Email links use:

```text
{FRONTEND_URL}/invitations/accept/<token>
```

Ensure SPA fallback works for this path pattern.

### Long-running API calls

The editor triggers long renders and uploads. Timeouts are governed by the **backend** and load balancer, not CloudFront (static assets only). No special frontend AWS config is required beyond correct `VITE_API_BASE_URL`.

---

## 10. CI/CD (GitHub Actions)

Example workflow: build on `main`, deploy to S3, invalidate CloudFront.

Create `.github/workflows/deploy-frontend-aws.yml`:

```yaml
name: Deploy Frontend (AWS)

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'package-lock.json'
      - 'vite.config.js'
      - 'index.html'
      - 'scripts/**'

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'

      - name: Install and build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          NODE_ENV: production
        run: |
          npm ci
          npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1

      - name: Sync to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.AWS_S3_BUCKET }}/ --delete \
            --cache-control "public, max-age=0, must-revalidate" \
            --exclude "assets/*"
          aws s3 sync dist/assets/ s3://${{ secrets.AWS_S3_BUCKET }}/assets/ \
            --cache-control "public, max-age=31536000, immutable"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/index.html" "/404.html" "/assets/*"
```

**GitHub secrets:**

| Secret | Description |
|--------|-------------|
| `VITE_API_BASE_URL` | Production API URL |
| `AWS_DEPLOY_ROLE_ARN` | IAM role for OIDC |
| `AWS_S3_BUCKET` | e.g. `athena-vi-prod` |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID |

**PR previews:** use a second S3 bucket + CloudFront distribution (or Amplify preview branches) with `VITE_API_BASE_URL` pointing at a staging API.

---

## 11. Environments

| Environment | Frontend URL | `VITE_API_BASE_URL` | S3 bucket |
|-------------|--------------|---------------------|-----------|
| Development | `http://localhost:5173` | unset (Vite proxy → `:9000`) | — |
| Staging | `https://staging.app.example.com` | `https://staging-api.example.com` | `athena-vi-staging` |
| Production | `https://app.example.com` | `https://api.example.com` | `athena-vi-prod` |

Use separate CloudFront distributions (or behaviors) per environment. Never point production frontend at a dev API.

---

## 12. Security headers

Apply via **CloudFront Response headers policy** (recommended):

| Header | Value |
|--------|--------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Tune per app; start restrictive and allow API + font CDNs |

These mirror the headers defined in `render.yaml` for the Render deployment.

**WAF (optional):** attach AWS WAF to CloudFront for rate limiting and bot control on public marketing pages.

---

## 13. Operations runbook

### Deploy new version

1. Merge to `main` → CI builds with correct `VITE_API_BASE_URL`
2. CI syncs `dist/` to S3 and invalidates CloudFront
3. Smoke test: login, Google OAuth, open `/dashboard/workspace`, deep-link refresh

### Rollback

**Option A — S3 versioning:** restore previous object versions, then invalidate CloudFront.

**Option B — Redeploy:** re-run CI on a previous git tag:

```bash
git checkout v1.2.3
npm ci && VITE_API_BASE_URL=https://api.example.com npm run build
# sync + invalidate as in section 6.5
```

### Rotate API URL

Changing backends requires a **rebuild** with a new `VITE_API_BASE_URL` and redeploy. There is no runtime switch.

### Health checks

CloudFront does not execute app logic. Validate:

- `GET https://app.example.com/` → 200, HTML contains root div
- `GET https://app.example.com/assets/*.js` → 200
- Browser: API login against production backend

### Logs and monitoring

- **CloudFront access logs** → S3 (optional, for traffic analysis)
- **CloudWatch alarms** on 5xx rate, origin errors
- **Real User Monitoring** — consider Sentry/Datadog on the frontend separately

---

## 14. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Blank page, 404 on refresh | Missing SPA fallback | Add CloudFront 403/404 → `/index.html` → 200 |
| API calls go to wrong host | `VITE_API_BASE_URL` wrong or unset at build | Rebuild with correct env; check CI secrets |
| CORS errors in browser | Backend missing frontend origin | Add `https://app.example.com` to API CORS |
| Google login lands on wrong page | `FRONTEND_URL` mismatch on backend | Align backend `FRONTEND_URL` with CloudFront URL |
| Stale UI after deploy | `index.html` cached | Short TTL on HTML; invalidate `index.html` on deploy |
| `accessToken` missing after OAuth | Callback path blocked | Ensure `/auth/google/callback` serves SPA |
| Mixed content warnings | API on HTTP | Use HTTPS for `VITE_API_BASE_URL` |

**Build warnings:** `scripts/render-build.mjs` logs a warning if `VITE_API_BASE_URL` is empty — treat that as a failed production build.

---

## 15. Cost overview

Approximate monthly cost for a low-traffic SaaS marketing + app shell (varies by region and traffic):

| Service | Typical cost |
|---------|----------------|
| S3 storage | &lt; $1 for static assets |
| CloudFront data transfer | $5–50+ depending on traffic |
| Route 53 hosted zone | ~$0.50/zone |
| ACM certificates | Free |
| CI (GitHub Actions) | Free tier or included in plan |

Static hosting on S3 + CloudFront is usually cheaper than running a Node server for this workload.

---

## 16. Alternative: AWS Amplify Hosting

For faster setup with built-in CI, **AWS Amplify Hosting** can replace manual S3 + CloudFront configuration.

| Step | Action |
|------|--------|
| 1 | Amplify Console → **Host web app** → connect Git repo |
| 2 | Build settings | `npm ci` → `npm run build` |
| 3 | Artifacts directory | `dist` |
| 4 | Environment variable | `VITE_API_BASE_URL` |
| 5 | Rewrites | SPA rule: `/<*>` → `/index.html` (200) |

**Amplify `amplify.yml` example:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22.22.0
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Amplify manages TLS, CDN, and SPA redirects. Use S3 + CloudFront when you need finer control (shared WAF, cross-account origins, custom cache policies).

---

## Quick reference

```bash
# Local dev
npm run dev

# Production build
VITE_API_BASE_URL=https://api.example.com npm run build

# Deploy
aws s3 sync dist/ s3://BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

**Related docs in this repo:**

- `api_doc.md` — backend API and auth
- `render.yaml` — equivalent deployment on Render (reference for routes and headers)
- `PLATFORM_FLOW_GUIDE.md` — end-user application flow

---

*Last updated: June 2026 — AthenaVI frontend, Vite 7 / React 19*
