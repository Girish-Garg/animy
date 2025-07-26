import axios from "axios";
import Prompt from "../schema/prompt.schema.js";
import Chat from "../schema/chat.schema.js";

export const generateVideo = async (req, res) => {
    try {
        const user = req.user;
        // Use validated data from the middleware
        const { chatId } = req.validatedData.params;
        const { prompt } = req.validatedData.body;

        const GenerateResponse = await axios.post(`${process.env.Video_API_BASE_URL}/video/generate`, {
            prompt,
            userId: user._id,
            chatId: chatId,
            filename : 'video'
        });

        if (!GenerateResponse.data.success) {
            return res.status(500).json({ success: false, error: 'Failed to generate video' });
        }

        const newPrompt = await Prompt.create({
            chatId,
            prompt,
            status: "processing"
        });

        await Chat.findByIdAndUpdate(chatId, {
            $push: { prompts: newPrompt },
            $set: { lastUpdated: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: 'Video generation started successfully',
            chatId: chatId,
            promptId: newPrompt._id,
            createdAt: newPrompt.createdAt,
        });

    } catch (error) {
        console.error('Error in generateVideo controller:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getVideoStatus = async (req, res) => {
    let chatId, promptId;
    let existingPrompt;
    try {
        const user = req.user;
        ({ chatId, promptId } = req.validatedData.params);
        console.log(`Fetching video status for chatId: ${chatId}, promptId: ${promptId}`);
        
        // Check local prompt status FIRST before making external API call
        if (promptId) {
            existingPrompt = await Prompt.findById(promptId);
            
            if (!existingPrompt) {
                return res.status(404).json({ success: false, error: 'Prompt not found' });
            }

            // If cancelled locally, return immediately without external API call
            if (existingPrompt.status === 'cancelled') {
                return res.status(200).json({
                    success: true,
                    status: 'cancelled',
                    message: 'Video generation was cancelled by user',
                    type: 'cancelled'
                });
            }
            
            // If already completed, return immediately
            if (existingPrompt.status === 'completed' && existingPrompt.video) {
                return res.status(200).json({
                    success: true,
                    status: 'completed',
                    video: existingPrompt.video,
                    message: 'Video generated successfully',
                    type: 'success'
                });
            }

            if (existingPrompt.status === 'failed') {
                return res.status(500).json({
                    success: false,
                    status: 'failed',
                    error: existingPrompt.errorMessage || 'Failed to generate video',
                    type: 'error'
                });
            }
        }
        
        // Only make external API call if not cancelled or completed or failed
        const response = await axios.get(`${process.env.Video_API_BASE_URL}/video/status/${user._id}/${chatId}`);
        console.log("Response from video status API:", response);
        if (!response.data.success) {
            return res.status(500).json({ success: false, error: 'Failed to fetch video status' });
        }
        console.log('Video status response:', response.data.status);
        
        if (promptId) {
            const existingPrompt = await Prompt.findById(promptId);
            
            if (response.data.status.status == 'failed') {
                const { message } = response.data.status;
                await Prompt.findByIdAndUpdate(existingPrompt._id, {
                    status: "failed",
                    errorMessage: message || 'Failed to generate video',
                });
                return res.status(500).json({
                    success: false,
                    type: 'error',
                    error: message || 'Failed to generate video', 
                    status: 'failed' 
                });
            }
            
            if (response.data.status.status == 'complete') {
                const video = {
                    videoPath: response.data.status.videoUrl,
                    thumbnailPath: response.data.status.thumbnailUrl,
                }
                await Prompt.findByIdAndUpdate(existingPrompt._id, {
                    status: "completed",
                    video: video,
                });
                return res.status(200).json({
                    success: true,
                    type: 'success', 
                    message: 'Video generated successfully',
                    video,
                    status: 'completed'
                });
            }
        }

        return res.status(200).json({
            success: true,
            status: response.data.status.status,
            video: response.data.status.videoUrl ? {
                videoPath: response.data.status.videoUrl,
                thumbnailPath: response.data.status.thumbnailUrl,
            } : null,
            message: response.data.status.message
        });

    } catch (error) {
        const existingPrompt = await Prompt.findById(promptId);
        if (error.status == 404 || error.status == 500) {
            await Prompt.findByIdAndUpdate(existingPrompt._id, {
                    status: "failed",
                    errorMessage: 'Failed to generate video via external API',
            });
            return res.status(500).json({
                    success: false,
                    type: 'error',
                    error: 'Failed to generate video via external API',
                    status: 'failed' 
            });
        }
        return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
    }
}

export const killStatus = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, promptId } = req.validatedData.params;
        
        console.log(`Killing video generation for user: ${user._id}, chatId: ${chatId}, promptId: ${promptId}`);
        
        // Find the prompt
        const existingPrompt = await Prompt.findById(promptId);
        
        if (!existingPrompt) {
            return res.status(404).json({ 
                success: false, 
                error: 'Prompt not found' 
            });
        }

        await Prompt.findByIdAndUpdate(promptId, {
            status: "cancelled",
            errorMessage: 'Video generation cancelled by user',
            updatedAt: new Date()
        });
        
        console.log(`Video generation cancelled for promptId: ${promptId}`);
        
        return res.status(200).json({
            success: true,
            message: 'Video generation cancelled successfully',
            status: 'cancelled',
            chatId: chatId,
            promptId: promptId
        });
    } catch (error) {
        console.error('Error in killStatus controller:', error);
        return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
    }
}