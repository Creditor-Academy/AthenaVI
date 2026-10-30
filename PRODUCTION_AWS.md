# Athena VI — Cost-effective AWS production (frontend + backend)

New production setup. Ignore the current EKS / Vercel / S3+CloudFront path. **CI/CD stays on Jenkins** (existing controller — do not add a new Jenkins EC2 to this account).

**Region:** `us-east-1` (existing `virtual-instructor` S3 bucket is already there)  
**DNS:** stays at **GoDaddy**. Do not transfer the domain to Route 53.  
**TLS:** free **ACM** on the ALB. Do not buy a paid GoDaddy SSL.

| Host | Role |
|------|------|
| `https://vi.lmsathena.com` | Frontend (React / Vite SPA, nginx) |
| `https://vi.api.lmsathena.com` | Backend (Express :9000 behind nginx) |

---

## 1. What each app needs

### Backend (Virtual Studio API)

One Express process that **must** have PostgreSQL and Redis at boot, already uses S3 in `us-east-1`, runs Remotion (Chromium + FFmpeg) on the same host, and starts background jobs **inside** that Node process.

That last point matters: run **one** API instance until you add leader election. Jobs (account purge, HeyGen wallet alerts, weekly digest, image-gen cleanup) run in-process.

### Frontend (this repo)

Static `dist/` served by nginx (`Dockerfile`: Node build → `nginx:alpine`, port 80, `try_files` → `index.html`). No Node runtime, no Postgres, no Redis, no Remotion on this box.

`VITE_API_BASE_URL` is baked in **at build time**. Changing the API URL requires a rebuild.

---

## 2. Shape (do not overbuild)

**One ALB + one API box + one small frontend box + managed Postgres + managed Redis + existing S3 + HTTPS in front.**

Not EKS, not Fargate, not a second ALB, not NAT Gateway on day 1. Jenkins already exists — reuse it; do not stand up another controller.

```text
Users
        │
   GoDaddy DNS
   CNAME  vi      →  ALB hostname
   CNAME  vi.api  →  ALB hostname
        │
   AWS us-east-1
   ALB :443  (free ACM cert, idle timeout 600s)
     host  vi.lmsathena.com      →  frontend TG  :80
     host  vi.api.lmsathena.com  →  backend TG   :80
        │
        ├── Frontend EC2  t3.small   (Nginx :80, static dist/)
        │
        └── Backend EC2   t3.xlarge  (Nginx :80 → Node :9000, PM2, 1 process)
              ├── RDS PostgreSQL     (private subnet)
              ├── ElastiCache Redis  (private subnet)
              ├── S3  virtual-instructor  (free VPC Gateway endpoint)
              └── HeyGen / Google / SES   (outbound via the instance public IP)
```

**TLS terminates on the ALB.** Nginx on both boxes stays HTTP-only.

Both EC2s sit in a **public subnet**. Inbound **only from the ALB security group**. Outbound to HeyGen / Google / SES uses the instance public IP — no NAT Gateway.

---

## 3. Shared AWS (create once)

| Piece | Choice | Why |
|-------|--------|-----|
| **VPC** | 1 VPC, 2 AZs. Public subnets for ALB + both EC2s. Private subnets for RDS + Redis | EC2 needs a public IP for egress without NAT |
| **ALB** | Internet-facing, 2 AZs (ALB requires 2). Idle timeout **600 seconds** | Avatar uploads up to ~900 MB; Remotion jobs run long |
| **ACM** | Public cert in **us-east-1** for `vi.lmsathena.com` **and** `vi.api.lmsathena.com` (or `*.lmsathena.com`) | Free, auto-renews |
| **S3** | Reuse `virtual-instructor` | No new media bucket |
| **S3 Gateway endpoint** | Free, in the VPC | API → S3 without NAT / public S3 hops |
| **Secrets** | SSM Parameter Store | Cheap at this scale (not Secrets Manager) |
| **Email** | Amazon SES SMTP | After domain verify; cheaper than a third-party SMTP |
| **CI/CD** | **Existing Jenkins** → ECR → SSH/docker pull + reload on the target EC2 | Reuse the controller you already have. Do not add a Jenkins box to this VPC. |
| **DNS** | GoDaddy CNAMEs only | No Route 53 hosted zone |

### ALB listener rules

| Condition | Target group | Health check |
|-----------|--------------|--------------|
| Host `vi.lmsathena.com` | frontend, instance port **80** | `GET /` → 200 |
| Host `vi.api.lmsathena.com` | backend, instance port **80** | `GET /` → `Virtual Instructor Backend Running` |

Redirect 80 → 443 on the ALB.

### Security groups (keep this tight)

| Group | Inbound | Outbound |
|-------|---------|----------|
| **ALB** | 443 and 80 from the internet | TCP 80 to frontend SG and backend SG |
| **Frontend EC2** | 80 from ALB only; SSH from your IP **and the Jenkins agent** (or SSM only — then no 22) | HTTPS 443 (OS updates, ECR pull). No 9000. |
| **Backend EC2** | 80 from ALB only; SSH from your IP **and the Jenkins agent** (or SSM only — then no 22) | 5432 to RDS, 6379 to Redis, 443 to HeyGen / Google / SES / S3 / ECR. **Do not open 9000.** |
| **RDS** | 5432 from backend EC2 only | — |
| **Redis** | 6379 from backend EC2 only | — |

Frontend never talks to RDS or Redis.

---

## 4. Backend sizing

| Piece | Choice | Why |
|-------|--------|-----|
| **Compute** | **t3.xlarge** (4 vCPU / 16 GB) | Official min is 8 GB; Remotion wants RAM more than raw CPU |
| **If renders are frequent** | Step up to **c6i.xlarge** or **c7i.xlarge** | Sustained CPU without burstable credits |
| **Disk** | **100 GB gp3** | Remotion uses `/tmp`; watch disk during exports |
| **Process** | PM2 **instances: 1** | In-process jobs; do not cluster until leader election exists |
| **RDS** | PostgreSQL 16, **db.t4g.medium**, Single-AZ, ~50 GB, 7-day backups, `sslmode=require` | Enough for early prod |
| **Redis** | ElastiCache **cache.t4g.small**, one node | Required in production (`REDIS_OPTIONAL` is only for local) |

### Backend deploy shape

1. Ubuntu 22.04 or Amazon Linux 2023: Node 20, Nginx, FFmpeg, Chromium deps  
2. App in `/opt/athena-vi`, env from SSM, **not** from a `.env` in Git  
3. Jenkins: checkout → `npm ci --omit=dev` → `npx prisma migrate deploy` → rsync/`git pull` on the box → `pm2 reload`  
4. Nginx on the box: `:80` → `127.0.0.1:9000`  
5. Health check: `GET /` → `Virtual Instructor Backend Running`  

Use a **separate Jenkins job** from the frontend (different repo, different target host). Do not deploy API and UI from one job.

### Backend env (production)

```text
BACKEND_URL=https://vi.api.lmsathena.com
FRONTEND_URL=https://vi.lmsathena.com
CORS_ORIGINS=https://vi.lmsathena.com
TRUST_PROXY_HOPS=1
```

Google OAuth authorized redirect:

```text
https://vi.api.lmsathena.com/api/auth/google/callback
```

Also required on the API (store in SSM): `DATABASE_URL`, Redis URL, `HEYGEN_API_KEY`, AWS credentials / instance role for S3, Google OAuth client, SES SMTP, JWT secret, stock API keys (Pexels / Unsplash / Pixabay), OpenAI / Gemini keys.

---

## 5. Frontend sizing

| Piece | Choice | Why |
|-------|--------|-----|
| **Compute** | **t3.small** (2 vCPU / 2 GB) | Nginx serving `dist/`. Typical RAM ~50–150 MB |
| **Count** | **1** | Static files. Add a second box only for HA |
| **Disk** | **30 GB gp3** | OS + Docker/nginx + `dist/`. No Remotion scratch |
| **Process** | Existing `Dockerfile` (nginx:alpine) or host nginx | Port 80 only |

Do **not** run `npm run build` on this instance (needs 4 GB+). Build on **Jenkins**.

### Frontend deploy shape

1. Ubuntu 22.04 or Amazon Linux 2023 + Docker  
2. Container from ECR (`vi-athena-frontend`), nginx on port 80  
3. Jenkins (same pipeline shape as the existing `Jenkinsfile`, **stop deploying to EKS**):

   ```text
   Checkout
     → write .env.production  (VITE_API_BASE_URL=https://vi.api.lmsathena.com)
     → npm ci
     → npm run build
     → docker build → ECR (vi-athena-frontend:$BUILD_NUMBER + :latest)
     → SSH to frontend EC2:
          docker pull …/vi-athena-frontend:$BUILD_NUMBER
          docker stop/rm frontend (if running)
          docker run -d --name frontend --restart unless-stopped -p 80:80 …
   ```

4. `nginx.conf` already has SPA fallback: `try_files $uri $uri/ /index.html;`

Point the Jenkins job’s `VITE_API_BASE_URL` at `https://vi.api.lmsathena.com` (not the old `https://api.vs.lmsathena.com`). Replace the `Deploy to Amazon EKS` stage with the SSH + `docker run` step above. SonarQube / Trivy stages can stay.

### Frontend env (build-time only)

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://vi.api.lmsathena.com` (no trailing slash) |

No secrets on the frontend box.

### Jenkins jobs

Two jobs on the **existing** Jenkins controller. Do not install Jenkins on the frontend or API EC2.

| Job | Repo | Build | Deploy target |
|-----|------|-------|----------------|
| **AthenaVI-Frontend** | this repo | `VITE_API_BASE_URL=https://vi.api.lmsathena.com` → `npm ci` → `npm run build` → Docker → ECR `vi-athena-frontend` | Frontend t3.small: `docker pull` + `docker run -p 80:80` |
| **AthenaVI-Backend** | API repo | `npm ci --omit=dev` → `prisma migrate deploy` | Backend t3.xlarge: rsync + `pm2 reload` (instances: 1) |

The current `Jenkinsfile` already does checkout, `.env.production`, npm build, SonarQube, Docker, Trivy, and ECR. For this setup, **change only the last stage**: drop `aws eks` / `kubectl` and SSH (or SSM) to the t3.small instead.

Give the Jenkins agent an IAM role (or keys) for ECR push/pull. The frontend EC2 needs an instance role (or `docker login` from Jenkins over SSH) to pull from ECR.

---

## 6. GoDaddy (domain stays there)

Do this in order.

### 6.1 ACM validation (first)

In ACM (`us-east-1`), request a public cert for `vi.lmsathena.com` and `vi.api.lmsathena.com` (or `*.lmsathena.com`). ACM gives validation CNAME records — add them in GoDaddy **exactly** as shown. Wait until the cert is **Issued**.

### 6.2 Point both hosts at the load balancer

| Type | Name | Value | TTL |
|------|------|--------|-----|
| CNAME | `vi` | `<alb-name>.us-east-1.elb.amazonaws.com` | 600 |
| CNAME | `vi.api` | `<alb-name>.us-east-1.elb.amazonaws.com` | 600 |

Do **not** point either name at an EC2 public IP.

---

## 7. What to skip on day 1

| Skip | Why |
|------|-----|
| **NAT Gateway** | ~$33/month plus $0.045/GB. Public-subnet EC2 + ALB-only inbound is enough. Add a free S3 Gateway endpoint. |
| **c6i.2xlarge** | ~$248/month. Start the API at 16 GB RAM; scale when renders queue. |
| **Oversized frontend** | t3.xlarge / 100 GB is for Remotion, not nginx. |
| **Second ALB** | Host-based routing on one ALB. |
| **Multi-AZ RDS / Redis** | Doubles DB cost. Single-AZ + automated snapshots first. |
| **EKS / ECS Fargate** | Overkill for one monolith; Remotion/Chromium is a poor Fargate fit. |
| **Paid GoDaddy SSL** | ACM is free and auto-renews. |
| **Route 53 hosted zone** | Extra cost and a DNS cutover for no gain. |
| **Multiple Node processes** | Stay at **PM2 instances: 1**. |
| **CloudFront / Vercel** | Frontend runs on the t3.small. Add CloudFront later if you want a CDN. |
| **Building the SPA on the instance** | Build on Jenkins with `VITE_API_BASE_URL`. |
| **New Jenkins EC2 in this VPC** | Use the Jenkins you already run. Adding another controller wastes money. |

---

## 8. Monthly cost (us-east-1, on-demand, light traffic)

| Resource | Approx. |
|----------|---------|
| ALB (shared) | $17–25 |
| Backend EC2 t3.xlarge | ~$122 |
| Backend EBS 100 GB gp3 | ~$8 |
| Frontend EC2 t3.small | ~$15 |
| Frontend EBS 30 GB gp3 | ~$2.50 |
| RDS db.t4g.medium Single-AZ + ~50 GB | ~$65–80 |
| ElastiCache cache.t4g.small | ~$19 |
| CloudWatch / SSM | $5–15 |
| ACM + S3 Gateway endpoint | $0 |
| Jenkins | $0 extra (existing controller) |
| S3 | existing `virtual-instructor` usage |
| **Total** | **about $250–290** |

The full private-subnet + NAT + c6i.2xlarge + extra ALB design lands closer to **$450–700**.

After 30 days of stable traffic, a 1-year Compute Savings Plan on the API box typically cuts that instance ~30–40%.

### Cheapest frontend variant

Skip the t3.small. On the **existing t3.xlarge**, add an nginx server block for `vi.lmsathena.com` that serves `dist/`, and keep `vi.api` proxied to Node :9000. ALB still terminates TLS and can send both hosts to the same instance.

Saves ~$18/month. Couples UI deploys to the Remotion box. Prefer the separate **t3.small** if you want to reload the UI without touching the API.

---

## 9. Provision checklist

- [ ] VPC + public subnets (EC2, ALB) + private subnets (RDS, Redis) in us-east-1  
- [ ] S3 Gateway VPC endpoint for `virtual-instructor`  
- [ ] ACM cert for `vi.lmsathena.com` + `vi.api.lmsathena.com`; validation CNAMEs in GoDaddy  
- [ ] ALB, idle timeout 600s, HTTPS listener, host-based rules  
- [ ] Security groups as in §3  
- [ ] RDS PostgreSQL 16, db.t4g.medium, Single-AZ, 50 GB, backups 7 days  
- [ ] ElastiCache Redis cache.t4g.small, one node  
- [ ] Backend EC2 t3.xlarge, 100 GB gp3, public subnet, IAM role for S3 + SSM  
- [ ] Frontend EC2 t3.small, 30 GB gp3, public subnet  
- [ ] SES domain verify for `lmsathena.com`  
- [ ] SSM parameters for backend secrets  
- [ ] GoDaddy CNAMEs `vi` and `vi.api` → ALB hostname  
- [ ] Google OAuth redirect URI updated  
- [ ] Jenkins agent can reach ECR (`us-east-1`) and SSH to both EC2s (or SSM Session Manager)  
- [ ] Frontend Jenkins job: `VITE_API_BASE_URL=https://vi.api.lmsathena.com`; deploy = docker pull on t3.small (not EKS)  
- [ ] Backend Jenkins job: migrate + `pm2 reload` on t3.xlarge  
- [ ] Smoke: `https://vi.lmsathena.com/` loads; login; refresh `/dashboard`; `https://vi.api.lmsathena.com/` health string  

---

## 10. When to spend more

| Signal | Action |
|--------|--------|
| Renders queue or `/tmp` fills | Move Remotion to a second **c7i.xlarge** worker; keep the API on t3.xlarge |
| Paying customers you cannot lose | Multi-AZ RDS, then a second API instance (**only** after jobs have a lock) |
| Compliance / no public IPs | Add one NAT Gateway then — not before |
| Frontend HA | Second t3.small in the other AZ, same target group |
| Global static cache | CloudFront in front of the ALB for `vi.lmsathena.com` only |

---

## 11. Related docs

| File | What it is |
|------|------------|
| `Jenkinsfile` | Existing frontend pipeline (still points at EKS). Retarget the deploy stage to the t3.small. |
| `FRONTEND_DEVOPS_AWS.md` | Older frontend path (S3 + CloudFront). Not this setup. |
| `TECH_STACK.md` | App stack and env names |
| `api_doc.md` | Backend API contract |
| `workspace-api.md` | Renders, S3 keys, storage |
| `HEYGEN.md` | Avatar / voice upload limits |

Backend application deploy details (Prisma, PM2, in-process jobs) live in the API repo’s `docs/DEVOPS_DEPLOYMENT.md`. This file is the **cheaper default** for a new production account: real HTTPS, real managed DB/cache, existing S3, GoDaddy DNS unchanged, frontend on its own small instance, and no NAT / Kubernetes / 8-vCPU box before traffic exists.
