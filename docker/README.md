# Docker Setup for OTT Admin Application (Windows)

## Quick Start

### Production Mode
```cmd
cd docker
docker-compose up --build
```

## Manual Production Updates (Recommended)

When you have new code changes and want to update the running application while preserving all data:

### Step-by-Step Manual Update Process

1. **Stop only the application container** (keeps database and data intact):
```cmd
docker-compose stop nextjs_app
```

2. **Rebuild the application with new code**:
```cmd
docker-compose build nextjs_app --no-cache
```

3. **Start the updated application**:
```cmd
docker-compose up -d nextjs_app
```

4. **Check if application is running**:
```cmd
docker-compose logs nextjs_app
```

### Alternative: Force rebuild everything (if needed)
```cmd
docker-compose up --build --force-recreate
```

## Data Persistence

### ✅ What Gets Preserved During Updates
- **PostgreSQL Database**: All user data, content metadata, authentication data
- **Upload Volumes**: Videos, posters, subtitles in `./data/` folders
- **Application Data**: Any files stored in Docker volumes

### 🔄 What Gets Updated
- Next.js application code
- API endpoints and business logic
- UI components and styling
- Dependencies (if package.json changed)
- Database schema (if Prisma migrations exist)

## Environment Setup

1. **Copy environment template**:
```cmd
copy .env.example .env
```

2. **Edit the `.env` file** and update `NEXTAUTH_SECRET` with a secure random string

## Database Access

- **PostgreSQL**: `localhost:5432`
- **Database**: `ott_db`
- **Username**: `ott_user`
- **Password**: `ott_pass`

## Common Update Scenarios

### Scenario 1: Code Changes (Components, API logic)
```cmd
docker-compose stop nextjs_app
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```

### Scenario 2: Added New Dependencies (package.json changed)
```cmd
docker-compose stop nextjs_app
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```

### Scenario 3: Database Schema Changes (Prisma migrations)
```cmd
docker-compose stop nextjs_app
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```
*Note: Migrations run automatically via the entrypoint script*

### Scenario 4: Docker Configuration Changes
```cmd
docker-compose down
docker-compose up --build
```

## Backup Strategy (Before Major Updates)

### Backup Database
```cmd
docker-compose exec postgres pg_dump -U ott_user ott_db > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Backup Upload Volumes
```cmd
docker run --rm -v ott-admin-v0_postgres_data:/data -v %cd%:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
docker run --rm -v ott-admin-v0_app_uploads:/data -v %cd%:/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .
```

## Troubleshooting

### View Application Logs
```cmd
docker-compose logs nextjs_app
```

### View Database Logs
```cmd
docker-compose logs postgres
```

### Restart Services
```cmd
docker-compose restart
```

### Clean Start (Removes containers but keeps data)
```cmd
docker-compose down
docker-compose up --build
```

### Nuclear Option (⚠️ Removes ALL data)
```cmd
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Health Checks

Check if your application is running:
- **Application**: http://localhost:3000
- **Database**: Use any PostgreSQL client with the credentials above