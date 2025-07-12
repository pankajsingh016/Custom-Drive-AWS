import request from "supertest";
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { authRouter } from "../src/routes/authRoutes.js";
import { fileRouter } from "../src/routes/fileRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);

let token;
let uploadedFileId;

beforeAll(async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ email: "tester@example.com", password: "testpass" });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "tester@example.com", password: "testpass" });

  token = res.body.token;
});

describe("📂 File CRUD routes", () => {
  const testFile = path.join(__dirname, "test.txt");

  beforeAll(() => {
    fs.writeFileSync(testFile, "Hello world test file");
  });

  afterAll(() => {
    fs.unlinkSync(testFile);
  });

  it("should upload file to S3 & DB", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", testFile);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("url");

    uploadedFileId = res.body.id;
  });

  it("should list uploaded files", async () => {
    const res = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should delete uploaded file", async () => {
    const res = await request(app)
      .delete(`/api/files/${uploadedFileId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should 404 on deleting non-existent file", async () => {
    const res = await request(app)
      .delete(`/api/files/999999`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("should reject upload without JWT", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .attach("file", testFile);

    expect(res.statusCode).toBe(401);
  });

  it("should reject upload with no file", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});
