import Chat from "../schema/chat.schema.js";
import Prompt from "../schema/prompt.schema.js";
import { v4 as uuidv4 } from 'uuid';
import generateVideoUtil from '../utils/generateVideo.js';
import uploadToR2 from '../utils/uploadToR2.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'animy-videos';
const TEMP_DIR = process.env.TEMP_DIR || os.tmpdir();

export const generateVideo = async (req, res) => {
    const socketId = req.body.socketId;
    
    try {
        const user = req.user;
        const { prompt } = req.body;
        const { chatId } = req.params;

        if (!prompt || !chatId) {
            return res.status(400).json({ error: "Prompt and chatId are required" });
        }

        const chat = await Chat.findOne({ _id: chatId, userId: user._id }).populate({
            path: 'prompts',
            select: 'prompt createdAt',
            options: { sort: { createdAt: -1 } }
        });
        
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const newPrompt = new Prompt({
            chatId,
            prompt,
        });
        
        await newPrompt.save();
        
        chat.prompts.push(newPrompt._id);
        await chat.save();

        const videoId = uuidv4();
        const filename = `${videoId}.mp4`;
        const tempFilePath = path.join(TEMP_DIR, filename);
        
        const promptHistory = chat.prompts.map(p => p.prompt);
        
        res.status(202).json({ 
            message: "Video generation started", 
            promptId: newPrompt._id,
            videoId
        });
        
        const onProgress = (progressData) => {
            if (socketId && req.app.io) {
                req.app.io.to(socketId).emit('videoProgress', {
                    videoId,
                    ...progressData
                });
            }
        };
        const result = await generateVideoUtil(prompt, tempFilePath, promptHistory, onProgress);
        
        if (result.success) {
            try {
                const videoUrl = await uploadToR2(result.filePath, BUCKET_NAME);
                
                newPrompt.videoUrl = videoUrl;
                await newPrompt.save();
                
                if (socketId && req.app.io) {
                    req.app.io.to(socketId).emit('videoComplete', {
                        videoId,
                        videoUrl,
                        promptId: newPrompt._id
                    });
                }
                
                console.log(`Video generation complete: ${videoUrl}`);
            } catch (uploadError) {
                console.error("Error uploading video to R2:", uploadError);
                
                newPrompt.errorMessage = 'Failed to upload video';
                await newPrompt.save();
                
                if (socketId && req.app.io) {
                    req.app.io.to(socketId).emit('videoError', {
                        videoId,
                        error: 'Failed to upload video'
                    });
                }
                
                if (fs.existsSync(result.filePath)) {
                    fs.unlinkSync(result.filePath);
                }
            }
        } else {
            console.error("Video generation failed:", result.error);
            
            newPrompt.errorMessage = result.error || 'Video generation failed';
            await newPrompt.save();
            
            if (socketId && req.app.io) {
                req.app.io.to(socketId).emit('videoError', {
                    videoId,
                    error: result.error || 'Video generation failed'
                });
            }
        }
    } catch (error) {
        console.error("Error in generateVideo controller:", error);
        
        if (socketId && req.app.io) {
            req.app.io.to(socketId).emit('videoError', {
                error: "Internal server error"
            });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
