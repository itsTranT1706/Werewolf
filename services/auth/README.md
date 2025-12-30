# 🔐 Werewolf Auth Service

A secure authentication microservice for the Werewolf game platform. Handles user registration, login, and JWT token management.

## 🚀 Features

- ✅ User registration with validation
- ✅ Secure password hashing (bcryptjs)
- ✅ JWT-based authentication
- ✅ PostgreSQL database with Prisma ORM
- ✅ Input validation with Zod
- ✅ Clean architecture (Controllers/Routes separation)
- ✅ Comprehensive error handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Navigate to the auth service directory:**
   ```bash
   cd services/auth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong secret key (change in production!)
   - `JWT_EXPIRES_IN`: Token expiration time (default: 24h)
   - `PORT`: Server port (default: 3000)

4. **Run Prisma migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## 🏃 Running the Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:3000` (or your configured PORT).

## 📡 API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "userId": "uuid-here"
}
```

**Error Responses:**
- `400`: Validation error or user already exists
- `500`: Server error

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "emailOrUsername": "john@example.com",
  "password": "secret123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "johndoe"
  }
}
```

**Error Responses:**
- `400`: Validation error
- `401`: Invalid credentials
- `500`: Server error

---

### 3. Health Check
**GET** `/api/auth/me`

**Success Response (200):**
```json
{
  "message": "Auth service is healthy",
  "timestamp": "2025-12-30T10:00:00.000Z"
}
```

---

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String   // Hashed with bcryptjs
  createdAt DateTime @default(now())
}
```

## 🔒 Security Features

- **Password Hashing**: Uses bcryptjs with 10 salt rounds
- **JWT Tokens**: Secure token generation with configurable expiration
- **Input Validation**: Zod schemas validate all inputs
- **Unique Constraints**: Email and username must be unique
- **Error Handling**: Secure error messages (no password leaks)

## 📁 Project Structure

```
services/auth/
├── src/
│   ├── controllers/
│   │   └── authController.js      # Business logic
│   ├── routes/
│   │   └── authRoutes.js          # Route definitions
│   ├── utils/
│   │   └── jwt.js                 # JWT helpers
│   ├── validators/
│   │   └── authValidators.js      # Zod schemas
│   └── index.js                   # Main server
├── prisma/
│   └── schema.prisma              # Database schema
├── .env.example                   # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing the API

Use curl, Postman, or any HTTP client:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"test123"}'
```

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

## 🐳 Docker Support

This service is part of the Werewolf microservices architecture and can be run with Docker Compose from the root directory.

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | 24h | No |
| `NODE_ENV` | Environment mode | development | No |

## ⚠️ Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Change `JWT_SECRET` in production** - Use a strong, random string
3. **Use HTTPS in production** - Encrypt data in transit
4. **Rotate JWT secrets periodically** - Improve security posture
5. **Set appropriate `JWT_EXPIRES_IN`** - Balance security and UX

## 🤝 Contributing

This is part of the Werewolf game microservices architecture. Follow the project's coding standards and security practices.

## 📄 License

MIT
