# Bytebot Deployment Documentation

This document covers our customized deployment of Bytebot on Coolify with specific modifications and configurations.

## 🎯 Project Overview

**Bytebot** is an open-source AI Desktop Agent - an AI system that has its own complete virtual computer to complete tasks autonomously. Unlike browser-only agents, Bytebot can:

- Use any desktop application (browsers, email clients, office tools, IDEs)
- Download and organize files with its own file system
- Handle complex multi-step workflows across different programs
- Process documents, PDFs, and spreadsheets
- Complete tasks just like a human would with mouse, keyboard, and screen access

**Original Project**: https://github.com/bytebot-ai/bytebot
**Our Fork**: https://github.com/johnnylafer/bytebot

---

## 🔧 Customizations Made

### 1. Updated OpenAI Models (January 2026)

**File Modified**: `packages/bytebot-agent/src/openai/openai.constants.ts`

**Changes**:
- Replaced outdated models (o3-2025-04-16, gpt-4.1-2025-04-14) with latest OpenAI models
- Added support for GPT-5 series: GPT-5.2, GPT-5.2 Pro, GPT-5, GPT-5 mini, GPT-5 nano
- Added latest reasoning models: o3, o4-mini, o3-mini
- Kept GPT-4.1 for backward compatibility

**Why**: The original fork contained placeholder models from April 2025. We updated to the actual available models as of January 2026 to provide access to OpenAI's latest and most capable models.

**Current Models Available**:
```typescript
- gpt-5.2              // Flagship model for coding and agentic tasks
- gpt-5.2-pro          // Enhanced version with smarter responses
- gpt-5                // Previous flagship reasoning model
- gpt-5-mini           // Faster, cost-efficient version
- gpt-5-nano           // Fastest, most affordable version
- o3                   // Advanced reasoning model
- o4-mini              // Fast reasoning model
- o3-mini              // Small reasoning model
- gpt-4.1              // Smartest non-reasoning model
```

### 2. Coolify Deployment Optimization

**File Modified**: `docker/docker-compose.yml`

**Changes**:
- Removed all `ports:` mappings except for internal communication
- Removed custom `networks:` sections
- Let Coolify's proxy (Traefik/Caddy) handle port exposure and routing

**Why**: Coolify manages networking through its integrated reverse proxy. Exposing ports in docker-compose.yml causes conflicts and prevents proper routing. By removing explicit port mappings, Coolify can automatically configure Traefik to route traffic to the correct containers.

### 3. PostgreSQL Port Configuration

**File Modified**: `docker/docker-compose.yml`

**Initial Change** (later reverted): Changed PostgreSQL external port from 5432 to 5433
**Final State**: Removed port mapping entirely to avoid conflicts with other services on the server

**Why**: The server already had a service using port 5432, causing deployment failures with "port is already allocated" errors. Since postgres only needs internal container communication (not external access), we removed the port mapping entirely.

### 4. Added HTTP Basic Authentication

**File Modified**: `docker/docker-compose.yml`

**Changes**:
- Added Traefik middleware for HTTP Basic Authentication
- Protected the bytebot-ui service with username/password
- Used bcrypt-hashed password for security

**Configuration**:
```yaml
labels:
  - "traefik.http.middlewares.bytebot-auth.basicauth.users=admin:$$2y$$05$$2YzQH5todciGEhqRJpUbuuhJAhLVIQuCh9niMVJ6XIlYjyh7EBd5a"
  - "traefik.http.routers.https-0-g44wwwoo0cgsoskw8gcs8skc-bytebot-ui.middlewares=gzip,bytebot-auth"
```

**Why**: Bytebot provides powerful desktop automation capabilities. Without authentication, anyone with the URL could access and control the system. Basic auth provides a simple but effective security layer.

---

## 🚀 Deployment Setup

### Infrastructure

**Deployment Platform**: Coolify v4.0.0-beta.444
**Server**: Tonkai Projects Server (DigitalOcean)
**Server IP**: 188.166.49.216
**Domain**: https://bytebot.tonkai.xyz
**SSL**: Automatic via Let's Encrypt (managed by Coolify)

### Architecture

The deployment consists of 4 Docker containers:

1. **bytebot-desktop** (Internal)
   - Ubuntu 22.04 with XFCE desktop environment
   - Firefox, VS Code, and development tools pre-installed
   - Runs VNC server for remote desktop access
   - Port 9990 (internal only)

2. **postgres** (Internal)
   - PostgreSQL 16 Alpine
   - Stores task history and application data
   - No external port (container-to-container communication only)

3. **bytebot-agent** (Internal)
   - NestJS backend service
   - Coordinates AI and desktop interactions
   - Connects to postgres and bytebot-desktop
   - Port 9991 (internal only)

4. **bytebot-ui** (Public)
   - Next.js web application
   - User interface for task management
   - Protected with HTTP Basic Auth
   - Accessible via https://bytebot.tonkai.xyz

### Domain Configuration

**DNS Setup** (Cloudflare):
```
Type: A Record
Name: bytebot
Value: 188.166.49.216
Proxy: Enabled (Orange cloud)
```

**Cloudflare SSL/TLS Mode**: Full (not Full Strict)
- Allows Coolify's self-signed certificates while Cloudflare handles client-facing SSL

**Coolify Domain Configuration**:
- Domain: `bytebot.tonkai.xyz` (configured in Coolify UI)
- Coolify automatically configures Traefik to route to port 9992 internally

---

## 🔑 Credentials & Access

### Application Access

**URL**: https://bytebot.tonkai.xyz

**HTTP Basic Auth**:
- Username: `admin`
- Password: `bytebot2026secure`

### Database

**Connection String** (internal):
```
postgresql://postgres:postgres@postgres:5432/bytebotdb
```

**Credentials**:
- User: `postgres`
- Password: `postgres`
- Database: `bytebotdb`

### Server Access

**SSH Command**:
```bash
sshpass -p 'mefpuz-Nansid-4woqxu' ssh root@188.166.49.216
```

---

## ⚙️ Environment Variables

The following environment variables are configured in Coolify:

```bash
# Service URLs (auto-configured by Coolify)
SERVICE_FQDN_BYTEBOT_UI=bytebot.tonkai.xyz
SERVICE_URL_BYTEBOT_UI=https://bytebot.tonkai.xyz

# Internal service communication
BYTEBOT_AGENT_BASE_URL=http://bytebot-agent:9991
BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop:9990
BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop:9990/websockify

# Database connection
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/bytebotdb

# AI Provider API Keys
OPENAI_API_KEY=sk-proj-[REDACTED]
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
```

**Note**: Currently configured with OpenAI. Add `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` to enable additional AI providers.

---

## 📝 Deployment Process

### Initial Setup

1. **Fork the repository** to https://github.com/johnnylafer/bytebot

2. **Create Coolify Application**:
   - Type: Docker Compose
   - Source: GitHub repository
   - Branch: `main`
   - Docker Compose path: `docker/docker-compose.yml`

3. **Configure Environment Variables** in Coolify UI:
   - Add `OPENAI_API_KEY` (required)
   - Optionally add `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`

4. **Set Domain**:
   - Go to bytebot-ui service in Coolify
   - Set domain to `https://bytebot.tonkai.xyz:9992`
   - Coolify configures Traefik automatically

5. **Deploy**:
   - Click "Deploy" in Coolify
   - Wait for all containers to start
   - Coolify automatically requests Let's Encrypt SSL certificate

### Redeployment

To deploy updates:

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Trigger deployment in Coolify**:
   - Click "Redeploy" button in Coolify UI
   - Or enable auto-deploy on push

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflict Errors

**Error**: `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution**:
- Ensure no `ports:` sections in docker-compose.yml (except for internal communication)
- Let Coolify manage all external port exposure

#### 2. Database Authentication Failures

**Error**: `P1000: Authentication failed against database server`

**Solution**:
- Check if postgres volume contains old data with different password
- Delete postgres volume via SSH:
  ```bash
  docker stop postgres-[container-id]
  docker rm -f postgres-[container-id]
  docker volume rm [volume-name]
  ```
- Redeploy to create fresh database

#### 3. Empty Model Dropdown

**Cause**: No AI provider API keys configured

**Solution**:
- Add at least one API key in Coolify environment variables:
  - `OPENAI_API_KEY` for OpenAI models
  - `ANTHROPIC_API_KEY` for Claude models
  - `GEMINI_API_KEY` for Google models
- Redeploy after adding keys

#### 4. Bad Gateway (502) Errors

**Causes**:
- bytebot-agent container not running or restarting
- Database connection issues
- Network isolation between containers

**Solution**:
- Check Coolify logs for bytebot-agent
- Verify DATABASE_URL is correct
- Ensure no custom networks that isolate containers from Coolify's proxy

#### 5. Basic Auth Not Working

**Cause**: Traefik middleware not applied to router

**Solution**:
- Verify labels in docker-compose.yml include both:
  - Middleware definition: `traefik.http.middlewares.bytebot-auth.basicauth.users=...`
  - Router application: `traefik.http.routers.[router-name].middlewares=gzip,bytebot-auth`
- Redeploy for changes to take effect

---

## 🔄 Maintenance

### Updating Models

When OpenAI releases new models:

1. Edit `packages/bytebot-agent/src/openai/openai.constants.ts`
2. Add new models to `OPENAI_MODELS` array:
   ```typescript
   {
     provider: 'openai',
     name: 'model-api-name',
     title: 'Display Name',
     contextWindow: 200000,
   }
   ```
3. Commit and push
4. Redeploy in Coolify

### Changing Credentials

**To change HTTP Basic Auth password**:

1. Generate new bcrypt hash:
   ```bash
   docker run --rm httpd:2.4-alpine htpasswd -nbB admin "newpassword"
   ```

2. Update docker-compose.yml label with new hash (escape $ as $$):
   ```yaml
   - "traefik.http.middlewares.bytebot-auth.basicauth.users=admin:$$2y$$..."
   ```

3. Commit, push, and redeploy

**To change database password**:

1. Update `POSTGRES_PASSWORD` in docker-compose.yml
2. Update `DATABASE_URL` in Coolify environment variables
3. Delete postgres volume (data will be lost)
4. Redeploy

### Monitoring

**Check container status**:
```bash
ssh root@188.166.49.216
docker ps | grep g44wwwoo0cgsoskw8gcs8skc
```

**View logs**:
- Use Coolify UI's built-in log viewer
- Or via SSH: `docker logs [container-name]`

**Check resource usage**:
```bash
docker stats
```

---

## 📚 Additional Resources

- **Original Project**: https://github.com/bytebot-ai/bytebot
- **Documentation**: https://docs.bytebot.ai
- **Coolify Docs**: https://coolify.io/docs
- **Traefik Basic Auth**: https://coolify.io/docs/knowledge-base/proxy/traefik/basic-auth

---

## 📄 License

This fork maintains the Apache 2.0 license from the original Bytebot project.

---

**Last Updated**: January 22, 2026
**Deployed Version**: Based on commit `3cc3b54`
**Coolify Version**: v4.0.0-beta.444
