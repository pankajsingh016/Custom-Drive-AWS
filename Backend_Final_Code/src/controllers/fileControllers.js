import {FileService} from "../services/fileService.js"

export const FileController = {
    async upload(req,res){
        try{
            if(!req.file) return res.status(400).json({error:"No file Uploaded"});
            const result = await FileService.upload(req.file, req.user.id);
            res.status(201).json(result);
        } catch(err){
            res.status(400).json({error:err.message})
        }

    },
    async list(req,res){
        try{
            const files = await FileService.list(req.user.id);
            res.json(files);

        } catch(err){
            res.status(400).json({error:err.message})
        }
    },
    async remove(req,res){
        try{
            await FileService.remove(Number(req.params.id),req.user.id);
            res.json({message:"File Deleted"});
        } catch(err){
            res.status(400).json({error:err.message});
        }
    }
}