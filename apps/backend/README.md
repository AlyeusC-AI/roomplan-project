# Service Geek Backend

This is the backend service for Service Geek, built with NestJS, Prisma, and PostgreSQL.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `service_geek`

4. Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/service_geek?schema=public"
   JWT_SECRET="your-super-secret-key-change-this-in-production"
   RESEND_API_KEY="your-resend-api-key"
   JWT_EXPIRATION="24h"
   FRONTEND_URL="http://localhost:3000"
   ```

5. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- POST `/auth/register` - Register a new user

  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "referralSource": "Google",
    "acceptReminders": true
  }
  ```

- POST `/auth/login` - Login

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- GET `/auth/verify-email?token=<verification-token>` - Verify email

## Features

- User registration with email verification
- JWT-based authentication
- Password hashing
- Email notifications using Resend
- Input validation
- CORS enabled
- PostgreSQL database with Prisma ORM
