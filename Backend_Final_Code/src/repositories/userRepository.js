import {prisma} from "../config/prismaClient.js";

const UserRepository = {
    create:(email, password)=>{
    },
    findByEmail:(email)=>{
        prisma.User.findUnique({where:{email}})
    }
}

export {UserRepository};


