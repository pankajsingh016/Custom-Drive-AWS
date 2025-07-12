import {s3} from "../config/s3Client.js";
import {PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const S3Storage = {
    async upload({Bucket, Key, Body}){
        await s3.send(new PutObjectCommand({Bucket, Key, Body}));
        return `http://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
    },

    async remove({Bucket, Key}){
        await s3.send(new DeleteObjectCommand({Bucket, Key}));
    }
}