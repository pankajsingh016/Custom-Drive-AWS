import { hash, compare } from 'bcryptjs';

export async function hashPassword(plain) { return await hash(plain, 10); }

export async function comparePasswords(plain, hashed) { return await compare(plain, hashed); }
