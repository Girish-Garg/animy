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
            promptId: newPrompt._id
        });

    } catch (error) {
        console.error('Error in generateVideo controller:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getVideoStatus = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, promptId } = req.validatedData.params;
        console.log(`Fetching video status for chatId: ${chatId}, promptId: ${promptId}`);
        const response = await axios.get(`${process.env.Video_API_BASE_URL}/video/status/${user._id}/${chatId}`);

        if (!response.data.success) {
            return res.status(500).json({ success: false, error: 'Failed to fetch video status' });
        }
        console.log('Video status response:', response.data.status);
        if (promptId) {
            const existingPrompt = await Prompt.findById(promptId);
            if (!existingPrompt) {
                return res.status(404).json({ success: false, error: 'Prompt not found' });
            }

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
        console.error('Error in getVideoStatus controller:', error);
        return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
    }
}