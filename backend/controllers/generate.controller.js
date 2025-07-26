import axios from "axios";
import Prompt from "../schema/prompt.schema.js";
import Chat from "../schema/chat.schema.js";
import { sendSuccessMail } from "../utils/sendSuccessMain.js";
// In-memory map to track polling jobs (promptId -> true)
const pollingJobs = {};

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

        // Always return instantly with current status
        if (existingPrompt && existingPrompt.status === 'processing') {
            // Start background polling if not already running
            if (!pollingJobs[promptId]) {
                pollingJobs[promptId] = true;
                (async function pollInBackground() {
                    let pollAttempts = 0;
                    const maxPolls = 60;
                    let done = false;
                    while (!done && pollAttempts < maxPolls) {
                        try {
                            const pollResponse = await axios.get(`${process.env.Video_API_BASE_URL}/video/status/${user._id}/${chatId}`);
                            if (!pollResponse.data.success) {
                                // Optionally log error
                                break;
                            }
                            const pollStatus = pollResponse.data.status.status;
                            if (pollStatus === 'failed') {
                                const { message } = pollResponse.data.status;
                                await Prompt.findByIdAndUpdate(promptId, {
                                    status: "failed",
                                    errorMessage: message || 'Failed to generate video',
                                });
                                done = true;
                                break;
                            }
                            if (pollStatus === 'complete') {
                                const video = {
                                    videoPath: pollResponse.data.status.videoUrl,
                                    thumbnailPath: pollResponse.data.status.thumbnailUrl,
                                };
                                await Prompt.findByIdAndUpdate(promptId, {
                                    status: "completed",
                                    video: video,
                                });
                                sendSuccessMail(user.email, existingPrompt.prompt, `https://app.animy.tech/chat/chat?id=${chatId}`);
                                done = true;
                                break;
                            }
                            if (pollStatus === 'cancelled') {
                                await Prompt.findByIdAndUpdate(promptId, {
                                    status: "cancelled",
                                    errorMessage: 'Video generation was cancelled by user',
                                });
                                done = true;
                                break;
                            }
                            // Save latest message from API if available
                            if (pollResponse.data.status && pollResponse.data.status.message) {
                                await Prompt.findByIdAndUpdate(promptId, {
                                    $set: { lastApiMessage: pollResponse.data.status.message }
                                });
                            }
                        } catch (err) {
                            // Optionally log error
                            break;
                        }
                        pollAttempts++;
                        await new Promise(resolve => setTimeout(resolve, 20000)); // 20 seconds
                    }
                    // Clean up job tracker
                    delete pollingJobs[promptId];
                })();
            }
            // Respond instantly with current status and last known message from DB
            return res.status(200).json({
                success: true,
                status: 'processing',
                video: null,
                message: existingPrompt.lastApiMessage || existingPrompt.errorMessage || 'Video is processing'
            });
        }

        // If not processing, return current status (should not reach here, but fallback)
        return res.status(200).json({
            success: true,
            status: existingPrompt ? existingPrompt.status : 'unknown',
            video: existingPrompt && existingPrompt.video ? existingPrompt.video : null,
            message: 'Generating...'
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