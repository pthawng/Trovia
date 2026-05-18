# Docker PostgreSQL & Prisma Setup for Local Development

This backend is pre-configured with a complete Docker-based PostgreSQL database and Prisma ORM setup.

---

## 🛠️ File Structure

All relevant configuration files:
- `docker-compose.yml` — Container configuration for PostgreSQL
- `.env.example` — Template file for environment variables
- `.env` — Active environment variables with the database connection string
- `prisma/schema.prisma` — Prisma schema containing tables (`profiles`, `user_roles`, `landlord_onboarding`)
- `prisma/seed.ts` — Database seed script to prepopulate sample profiles and roles
- `package.json` — Upgraded with the required utility scripts and dependencies

---

## 📦 Automation Scripts

The following scripts are added to your `package.json`:

### 🗄️ Docker PostgreSQL Controls
- `pnpm db:up` — Start the local PostgreSQL docker container in background
- `pnpm db:down` — Terminate and remove the database container
- `pnpm db:restart` — Terminate and recreate the database container
- `pnpm db:logs` — Watch live logs from the PostgreSQL instance

### 📐 Prisma Database Migrations & Tools
- `pnpm prisma:generate` — Regenerate the Prisma Client typescript bindings
- `pnpm prisma:migrate` — Detect schema changes, generate & apply migration SQL
- `pnpm prisma:studio` — Start a GUI database visualizer at `http://localhost:5555`
- `pnpm db:seed` — Prepopulate mock profiles/roles to the database
- `pnpm db:reset` — Completely drop and recreate the database schema and re-run seed

---

## 🚀 Standard Local Development Workflow

To initialize and run this backend for local development, run these commands inside the `backend/` directory:

1. **Install all packages**:
   ```bash
   pnpm install
   ```
2. **Start the local PostgreSQL container**:
   ```bash
   pnpm db:up
   ```
3. **Deploy database tables & migrations**:
   ```bash
   pnpm prisma:migrate
   ```
4. **Seed mock data (adds default admin/tenant profile)**:
   ```bash
   pnpm db:seed
   ```
5. **Start your local NestJS development server**:
   ```bash
   pnpm start:dev
   ```

---

> [!NOTE]
> All credentials are kept safe within the `.env` file. You do not need to have PostgreSQL installed locally on your operating system; everything runs seamlessly inside Docker.
