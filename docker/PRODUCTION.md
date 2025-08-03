# Production Deployment Strategy (Windows)

## Manual Production Updates with Data Preservation

### Recommended Update Process
This approach updates your application while preserving all data:

```cmd
REM 1. Pull latest changes from your repository
git pull origin main

REM 2. Stop only the application container (keep database running)
docker-compose stop nextjs_app

REM 3. Rebuild the application image with latest code
docker-compose build nextjs_app --no-cache

REM 4. Start the updated application
docker-compose up -d nextjs_app
```

## What Gets Preserved vs Updated

### ✅ Preserved (Data Persistence)
- **PostgreSQL Database**: All user data, content metadata, authentication data
- **Upload Volumes**: Videos, posters, subtitles in `/data` folders
- **Application Data**: Any files stored in `app_uploads` volume

### 🔄 Updated (Application Code)
- Next.js application code
- API endpoints
- UI components
- Dependencies
- Configuration changes

## Database Migrations During Updates

Your setup automatically handles database schema changes:

1. **Prisma migrations** run automatically via `entrypoint.sh`
2. **Backward compatible** changes work seamlessly
3. **Breaking changes** need special handling (see backup section)

## Handling Different Types of Updates

### Simple Code Changes (Components, API logic)
```cmd
docker-compose stop nextjs_app
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```

### Database Schema Changes
```cmd
REM Migrations run automatically via entrypoint.sh
docker-compose stop nextjs_app
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```

### Breaking Changes (Requires data backup)
```cmd
REM 1. Backup database first
docker-compose exec postgres pg_dump -U ott_user ott_db > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

REM 2. Backup volumes
docker run --rm -v ott-admin-v0_postgres_data:/data -v %cd%:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
docker run --rm -v ott-admin-v0_app_uploads:/data -v %cd%:/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .

REM 3. Deploy update
docker-compose down
docker-compose up -d --build
```

## Rollback Strategy

If something goes wrong, you can quickly rollback:

### Method 1: Rebuild from previous commit
```cmd
docker-compose stop nextjs_app
git checkout <previous-commit>
docker-compose build nextjs_app --no-cache
docker-compose up -d nextjs_app
```

### Method 2: Restore from backup (if database changes were involved)
```cmd
docker-compose exec -T postgres psql -U ott_user -d ott_db < backup_YYYYMMDD.sql
```

## Verification Steps

After updating, verify everything is working:

1. **Check application status**:
```cmd
docker-compose ps
```

2. **View application logs**:
```cmd
docker-compose logs nextjs_app
```

3. **Test application**:
   - Visit http://localhost:3000
   - Test login functionality
   - Verify video streaming works

4. **Check database connectivity**:
```cmd
docker-compose exec postgres psql -U ott_user -d ott_db -c "\dt"
```