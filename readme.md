# Backend Flow Strcture for the project
# 📁 Google Drive Clone — Node.js + Prisma + AWS S3 + SQLite + Docker

A production-ready **Google Drive clone backend**, built with:

- ✅ **Node.js** (Express)
- ✅ **Prisma ORM** + **SQLite**
- ✅ **AWS S3** for secure file storage
- ✅ **JWT Auth** (register/login)
- ✅ **Multer** for file uploads
- ✅ **Docker** + **Docker Compose**
- ✅ **Jest + Supertest** for tests

---

## 🚀 Features

- Register/Login with hashed passwords  
- Upload files securely to S3  
- List only your files  
- Delete files (S3 + DB)  
- Modular architecture (helpers, repos, controllers)  
- Runs in Docker, ready for ECS/Fargate

---

## 📂 Final Folder Structure

```plaintext
google-drive-clone/
├── .env
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── prismaClient.js
│   │   ├── awsClient.js
│   ├── helpers/
│   │   ├── authHelper.js
│   │   ├── s3Helper.js
│   ├── repositories/
│   │   ├── userRepo.js
│   │   ├── fileRepo.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── multerConfig.js
├── __tests__/
│   ├── auth.test.js
│   ├── file.test.js
│   ├── testFile.txt
└── README.md
```


## ⚙️ Quick Setup
### 1️⃣ Clone the repo
``` 
git clone https://github.com/YOUR_USERNAME/google-drive-clone.git
cd google-drive-clone
```
## 2️⃣ Install dependencies
``` npm install
```

## 3️⃣ Create .env file
```
DATABASE_URL="file:./dev.db"
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET=my-drive-clone
JWT_SECRET=YOUR_SECRET

```

## 4️⃣ Run Prisma migration
```
npx prisma migrate dev --name init
```

## 🐳 Run with Docker
``` 
docker build -t google-drive-backend .
docker run --env-file .env -p 5000:5000 google-drive-backend
```

## ⚡ Run locally (Dev)
``` 
npm run dev
```

## ✅ Run Tests
```
npm test
```

| Method | Route                | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/api/auth/register` | Register new user          |
| POST   | `/api/auth/login`    | Login and get JWT token    |
| POST   | `/api/files/upload`  | Upload file (JWT required) |
| GET    | `/api/files`         | List user’s files (JWT)    |
| DELETE | `/api/files/:id`     | Delete file by ID (JWT)    |
