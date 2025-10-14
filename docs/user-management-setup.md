# User Management Setup Guide

## Overview

The Farm Animal Tracker now includes a complete user management system with role-based access control (RBAC). This guide will help you set up and use the admin panel.

## Features

- ✅ Create, Read, Update, Delete (CRUD) users
- ✅ Role-based access control (USER and ADMIN roles)
- ✅ Secure password hashing with bcryptjs
- ✅ Active/Inactive user status
- ✅ Admin-only access to user management
- ✅ Prevent admins from deleting/deactivating themselves

## Database Schema Changes

A new `User` model has been added to the Prisma schema:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String   // Hashed password
  role      String   @default("USER") // USER or ADMIN
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## Setup Instructions

### 1. Ensure Database Connection

Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="sqlserver://your-server.database.windows.net:1433;database=your-db;user=your-user;password=your-password;encrypt=true;trustServerCertificate=false;connectionTimeout=30"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Apply Database Migration

```bash
npm run db:push
```

Or create a formal migration:

```bash
npm run db:migrate
```

### 3. Create Your First Admin User

You'll need to create an admin user directly in the database. Here's a Node.js script to do this:

**create-admin.js**:
```javascript
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@example.com'; // Change this
  const password = 'your-secure-password'; // Change this
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      active: true
    }
  });

  console.log('Admin user created:', admin.email);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
node create-admin.js
```

**Alternative: SQL Script**

For Azure SQL Server:
```sql
-- First, generate a hashed password using bcryptjs
-- Example: bcryptjs hash of 'password123' with salt rounds 10
-- You can use an online tool or Node.js to generate this

INSERT INTO users (email, name, password, role, active, createdAt, updatedAt)
VALUES (
  'admin@example.com',
  'Admin User',
  '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
  'ADMIN',
  1,
  GETDATE(),
  GETDATE()
);
```

### 4. Update Environment Variables

The authentication system no longer uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. These can be removed from your `.env` file.

### 5. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in with your admin credentials at `/auth/signin`

3. Navigate to "Manage Users" in the header (only visible to admins)

## Using the Admin Panel

### Accessing the Admin Panel

- URL: `/admin/users`
- Only accessible to users with `ADMIN` role
- Non-admin users will be redirected to the home page

### Creating a User

1. Click the "Create User" button
2. Fill in the required fields:
   - **Email** (required): User's email address
   - **Name** (optional): User's full name
   - **Password** (required): Initial password
   - **Role** (required): USER or ADMIN
   - **Active** (checkbox): Whether the user can sign in

3. Click "Create" to save

### Editing a User

1. Click "Edit" next to any user in the table
2. Modify the fields as needed
3. To keep the existing password, leave the password field blank
4. Click "Update" to save changes

### Deleting a User

1. Click "Delete" next to any user
2. Confirm the deletion
3. **Note**: You cannot delete your own account

### User Roles

- **USER**: Can access the application and manage animals/weights
- **ADMIN**: Has USER permissions plus access to user management

### Security Features

- ✅ Passwords are hashed with bcryptjs (10 salt rounds)
- ✅ Admins cannot delete themselves
- ✅ Admins cannot deactivate themselves
- ✅ Only active users can sign in
- ✅ Email addresses must be unique
- ✅ All admin routes check for ADMIN role

## API Endpoints

### List All Users
```
GET /api/admin/users
Authorization: Admin role required
Response: { users: User[] }
```

### Get Single User
```
GET /api/admin/users/[id]
Authorization: Admin role required
Response: { user: User }
```

### Create User
```
POST /api/admin/users
Authorization: Admin role required
Body: {
  email: string (required)
  name?: string
  password: string (required)
  role?: 'USER' | 'ADMIN'
  active?: boolean
}
Response: { user: User }
```

### Update User
```
PATCH /api/admin/users/[id]
Authorization: Admin role required
Body: {
  email?: string
  name?: string
  password?: string
  role?: 'USER' | 'ADMIN'
  active?: boolean
}
Response: { user: User }
```

### Delete User
```
DELETE /api/admin/users/[id]
Authorization: Admin role required
Response: { message: string }
```

## Troubleshooting

### "Unauthorized" Error

- Ensure you're signed in as an admin
- Check that your user has `role: 'ADMIN'` in the database
- Clear your browser cache and sign in again

### Cannot Create Users

- Verify the database connection
- Check that the users table was created (`npx prisma db push`)
- Ensure bcryptjs is installed (`npm install bcryptjs`)

### Migration Issues

If you're migrating an existing database:

1. Back up your database first
2. Run `npx prisma db push` to add the users table
3. Create an admin user using the script above
4. Test sign-in with the new admin account

## Next Steps

- Set up regular password rotation policies
- Configure email notifications for new users
- Add user activity logging
- Implement password reset functionality
