# CI/CD Pipeline — TaskFlow

## Overview

Every `git push` to the `main` branch automatically runs tests, builds Docker images, pushes them to Docker Hub, and deploys the app to a live VPS — with zero manual steps.

Pushes to any **other branch** only run the test and build checks (no deploy).

---

## Full Pipeline Flow

```
Developer pushes to main
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                    GitHub Actions                    │
│                                                     │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │ Backend Tests   │    │ Frontend Build Check │   │
│  │  (npm test)     │    │  (next build)        │   │
│  └────────┬────────┘    └──────────┬───────────┘   │
│           │                        │                │
│           └──────────┬─────────────┘                │
│                      │ Both must pass               │
│                      ▼                              │
│         ┌────────────────────────┐                 │
│         │  Build & Push to       │                 │
│         │  Docker Hub            │                 │
│         │                        │                 │
│         │  chatgpt2103/          │                 │
│         │    taskflow-api:latest │                 │
│         │    taskflow-web:latest │                 │
│         └────────────┬───────────┘                 │
│                      │                              │
│                      ▼                              │
│         ┌────────────────────────┐                 │
│         │  Deploy to VPS         │                 │
│         │  (SSH into             │                 │
│         │   187.127.151.48)      │                 │
│         │                        │                 │
│         │  docker compose pull   │                 │
│         │  docker compose up -d  │                 │
│         └────────────────────────┘                 │
└─────────────────────────────────────────────────────┘
         │
         ▼
   App is live at
   http://187.127.151.48:3000  (Frontend)
   http://187.127.151.48:4000  (API)
```

---

## Stage-by-Stage Breakdown

### Stage 1 — Backend Unit Tests

**Runs on:** Every push to every branch

**What it does:**
- Checks out the code
- Installs Node.js 20 dependencies (`npm ci`)
- Generates the Prisma client
- Runs all Jest unit tests (`npm test`)

**If this fails:** Pipeline stops. Nothing is built or deployed.

---

### Stage 2 — Frontend Build Check

**Runs on:** Every push to every branch (in parallel with Stage 1)

**What it does:**
- Installs Next.js dependencies
- Runs a full production build (`next build`)
- Catches TypeScript errors, missing imports, broken pages

**If this fails:** Pipeline stops. Nothing is deployed.

---

### Stage 3 — Build & Push Docker Images

**Runs on:** `main` branch only, after both Stage 1 and Stage 2 pass

**What it does:**
- Logs into Docker Hub using stored credentials
- Builds two Docker images from source:
  - `chatgpt2103/taskflow-api` — NestJS backend
  - `chatgpt2103/taskflow-web` — Next.js frontend
- Pushes both images with two tags:
  - `:latest` — always points to the newest build
  - `:<commit-sha>` — pinned tag for rollback if needed
- Uses GitHub Actions cache to speed up subsequent builds

**Where images live:** [hub.docker.com/u/chatgpt2103](https://hub.docker.com/u/chatgpt2103)

---

### Stage 4 — Deploy to VPS

**Runs on:** `main` branch only, after Stage 3 succeeds

**What it does:**
1. Copies `docker-compose.prod.yml` to the VPS via SCP
2. SSHs into the VPS (`187.127.151.48`)
3. Pulls the latest images from Docker Hub
4. Restarts all containers with zero-downtime (`--remove-orphans`)
5. Cleans up old unused images

**Authentication:** Uses a dedicated ED25519 SSH key pair. The private key is stored as a GitHub Secret (`VPS_SSH_KEY`). The public key is in the VPS `~/.ssh/authorized_keys`.

---

## Infrastructure

### VPS (Hostinger KVM 2)

| Detail | Value |
|---|---|
| Provider | Hostinger |
| OS | Ubuntu 24.04 LTS |
| IP | 187.127.151.48 |
| Docker | Pre-installed via Hostinger Docker VPS |
| App directory | `/opt/taskflow` |

### Services running on VPS

| Container | Image | Port |
|---|---|---|
| `taskflow-postgres` | `postgres:15-alpine` | 5432 |
| `taskflow-api` | `chatgpt2103/taskflow-api:latest` | 4000 |
| `taskflow-web` | `chatgpt2103/taskflow-web:latest` | 3000 |

### Docker Hub

| Repository | Tags |
|---|---|
| `chatgpt2103/taskflow-api` | `latest`, `<commit-sha>` |
| `chatgpt2103/taskflow-web` | `latest`, `<commit-sha>` |

---

## GitHub Secrets

All sensitive values are stored as encrypted GitHub repository secrets. They are never hardcoded in the codebase.

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub login username |
| `DOCKERHUB_TOKEN` | Docker Hub personal access token |
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | SSH username (`root`) |
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `VPS_PORT` | SSH port (22) |
| `NEXT_PUBLIC_API_URL` | Backend URL injected at frontend build time |

---

## Branch Strategy

| Branch | Tests | Build & Push | Deploy |
|---|---|---|---|
| `main` | ✅ | ✅ | ✅ |
| any other branch | ✅ | ❌ | ❌ |

---

## Dockerfile Notes

Both Dockerfiles use **multi-stage builds** to keep production images small:

**Backend (`backend/Dockerfile`)**
- Stage 1 `builder` — installs all deps, generates Prisma client, compiles TypeScript
- Stage 2 `production` — copies only the compiled `dist/` and prod `node_modules`
- On startup: runs `prisma migrate deploy` before starting the server

**Frontend (`frontend/Dockerfile`)**
- Stage 1 `deps` — installs dependencies
- Stage 2 `builder` — runs `next build` with `output: standalone`
- Stage 3 `runner` — copies only the standalone output (smallest possible image)

---

## How to Trigger a Deployment

```bash
# Make your changes, commit, and push to main
git add .
git commit -m "your message"
git push origin main
```

That's it. The entire pipeline runs automatically.

---

## Rollback

Every deploy is tagged with the commit SHA on Docker Hub. To roll back to a previous version, SSH into the VPS and run:

```bash
cd /opt/taskflow

# Replace <sha> with the commit hash you want to roll back to
DOCKERHUB_USERNAME=chatgpt2103 \
docker compose -f docker-compose.prod.yml \
  up -d \
  --image chatgpt2103/taskflow-api:<sha> \
  --image chatgpt2103/taskflow-web:<sha>
```
