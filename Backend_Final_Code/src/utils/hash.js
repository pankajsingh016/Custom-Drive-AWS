import bcrypt from "bcrypt"

export async function hashPassword(plain){
    return bcrypt.hash(plain,10);
}

export async function comparePassword(plain, hashPassword){
    return bcrypt.compare(plain,hashPassword);
}
