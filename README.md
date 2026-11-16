# TwoLeaves - Smart Tea Estate Management System
### Little Liddesdale Estate (LLD)

A production-minded, modular web application for tea estate operations, crop yield monitoring, field management, plucker intake, agronomy activities, and reporting tailored for **Little Liddesdale Estate**.

---

## Architecture Overview

```text
├── backend/                         # ASP.NET Core Web API (.NET 11, C#)
│   ├── TeaEstate.sln
│   ├── src/
│   │   ├── TeaEstate.Domain/        # Domain entities, value objects, enums
│   │   ├── TeaEstate.Application/   # Use cases, DTOs, calculations, interfaces
│   │   ├── TeaEstate.Infrastructure/# EF Core, PostgreSQL DbContext, Identity, ClosedXML
│   │   └── TeaEstate.Api/           # Controllers, Middlewares, OpenAPI Swagger
│   └── tests/
│       ├── TeaEstate.UnitTests/     # MTD, monthly yield, variance calculation tests
│       └── TeaEstate.IntegrationTests/
├── frontend/                        # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── config/appConfig.ts      # Branding configuration (App name, logo, icons)
│   │   ├── features/                # Domain-driven feature modules
│   │   ├── components/              # Shared UI components
│   │   └── services/                # API client & TanStack Query hooks
├── docs/                            # SRS, API designs, Architecture Decision Records
├── docker-compose.yml               # PostgreSQL 16 + pgAdmin 4 local environment
└── .env.example                     # Environment configuration template
```

---

## Getting Started

### 1. Database (Docker Compose)
Start PostgreSQL and pgAdmin:
```bash
docker compose up -d
```
* PostgreSQL: `localhost:5432` (User: `postgres`, Password: `postgres123`, DB: `tea_estate_db`)
* pgAdmin: `http://localhost:5050` (Email: `admin@teaestate.local`, Password: `admin123`)

### 2. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/TeaEstate.Api
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## App Branding & Deployment Note
The application title, branding, and icon assets are centralized in:
* `frontend/src/config/appConfig.ts`
* `backend/src/TeaEstate.Api/appsettings.json`

When you are ready to deploy and have finalized the project name and icon, simply update these configuration files and replace the icon files in `frontend/public/`.
