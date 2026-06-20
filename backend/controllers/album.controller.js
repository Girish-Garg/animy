import videoApi from "../utils/videoApi.js";
import Album from "../schema/album.schema.js";
import User from "../schema/user.schema.js";
import Prompt from "../schema/prompt.schema.js";
import Chat from "../schema/chat.schema.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

export const createAlbum = async (req, res) => {
    try {
        const user = req.user;
        const { albumName } = req.body;
        if (!albumName) {
            return res.status(400).json({ success: false, error: "Album Name is required" });
        }

        const existingAlbum = await Album.findOne({ albumName: albumName.trim(), userId: user._id });
        if( existingAlbum ) {
            return res.status(400).json({ success: false, error: "Album with this name already exists" });
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const album = new Album({
                    userId: user._id,
                    albumName: albumName.trim(),
                });
                await album.save({ session });
                await User.findByIdAndUpdate(
                    user._id,
                    { $push: { albumIds: album._id } },
                    { session }
                );
            });
        } finally {
            session.endSession();
        }

        res.status(201).json({
            success: true,
            message: "Album created successfully",
        });
    } catch (err) {
        logger.error('Error in createAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const addToAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { video, chatId, name } = req.body;
        const user = req.user;

        if (!albumId || !chatId || !video || typeof video !== 'object') {
            return res.status(400).json({ success: false, error: "albumId, chatId and video are required" });
        }

        const album = await Album.findOne({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ success: false, error: "Album not found or unauthorized" });
        }
        // Authorization: the chat must belong to the requesting user.
        const chat = await Chat.findOne({ _id: chatId, userId: user._id });
        if (!chat) {
            return res.status(404).json({ success: false, error: "Chat not found or unauthorized" });
        }

        // Source of truth: find the prompt that actually holds this video in the
        // user's chat. Filenames are derived from the stored record, never from
        // the request body (prevents arbitrary paths reaching the media API).
        const prompt = await Prompt.findOne({
            chatId,
            'video.videoPath': video.videoPath,
            'video.thumbnailPath': video.thumbnailPath,
        });
        if (!prompt || !prompt.video) {
            return res.status(404).json({ success: false, error: "Video not found in this chat" });
        }

        const videoPathSegment = prompt.video.videoPath.split('/');
        const thumbnailPathSegment = prompt.video.thumbnailPath.split('/');
        if (videoPathSegment[videoPathSegment.length - 2] === 'album' && thumbnailPathSegment[thumbnailPathSegment.length - 2] === 'album') {
            return res.status(400).json({ success: false, error: "Video already exists in album" });
        }
        const videoName = videoPathSegment.pop();
        const thumbnailName = thumbnailPathSegment.pop();
        const [videoRes, thumbnailRes] = await Promise.all([
            videoApi.post(`${process.env.Video_API_BASE_URL}/chat/move/${user._id}/${chatId}/${videoName}`),
            videoApi.post(`${process.env.Video_API_BASE_URL}/chat/move/${user._id}/${chatId}/${thumbnailName}`),
        ]);
        if (!videoRes.data || !thumbnailRes.data) {
            return res.status(500).json({ success: false, error: "Failed to move video or thumbnail" });
        }
        await Prompt.findByIdAndUpdate(
            prompt._id,
            { $set: { 'video.videoPath': videoRes.data.newUrl, 'video.thumbnailPath': thumbnailRes.data.newUrl } },
            { new: true }
        );
        const videoToAdd = {
            name: name,
            videoPath: videoRes.data.newUrl,
            thumbnailPath: thumbnailRes.data.newUrl,
        }
        album.videos.push(videoToAdd);
        await album.save();

        return res.status(200).json({
            success: true,
            message: "Videos uploaded successfully",
        });

    } catch (err) {
        logger.error('Error in uploadToAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const user = req.user;
        if (!albumId) {
            return res.status(400).json({ success: false, error: "Album ID is required" });
        }
        const album = await Album.findOne({ _id: albumId, userId: user._id}).lean();
        if (!album) {
            return res.status(404).json({ success: false, error: "Album not found or unauthorized" });
        }
        return res.status(200).json({
            success: true,
            message: "Album retrieved successfully",
            album: {
                name: album.albumName,
                videos: album.videos,
                createdAt: album.createdAt,
                updatedAt: album.updatedAt
            }
        });
    } catch (err) {
        logger.error('Error in getAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const deleteAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const user = req.user;
        if (!albumId) {
            return res.status(400).json({ success: false, error: "Album ID is required" });
        }

        const album = await Album.findOneAndDelete({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ success: false, error: "Album not found or unauthorized" });
        }

        for (const video of album.videos) {
            const videoName = video.videoPath.split('/').pop();
            const thumbnailName = video.thumbnailPath.split('/').pop();
            const videoRes = await videoApi.delete(`${process.env.Video_API_BASE_URL}/chat/album/${user._id}/${videoName}`);
            const thumbnailRes = await videoApi.delete(`${process.env.Video_API_BASE_URL}/chat/album/${user._id}/${thumbnailName}`);
            if (!videoRes.data || !thumbnailRes.data) {
                logger.error(`Failed to delete video or thumbnail: ${videoName} or ${thumbnailName}`);
            }
        }

        await User.findByIdAndUpdate(user._id,
            { $pull: { albumIds: album._id } }
        );

        // Get remaining albums after deletion
        const remainingAlbums = await Album.find({ userId: user._id })
            .select("_id albumName createdAt updatedAt videos")
            .sort({ updatedAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Album deleted successfully",
            albums: remainingAlbums,
        });
    } catch (err) {
        logger.error('Error in deleteAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const deleteFromAlbum = async (req, res) => {
    try {
        const { albumId, videoId } = req.params;
        const user = req.user;
        
        if (!albumId || !videoId) {
            return res.status(400).json({ success: false, error: "albumId and videoId are required" });
        }
        
        const album = await Album.findOne({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ success: false, error: "Album not found or unauthorized" });
        }
        
        const videoToDelete = album.videos.find(video => video._id.toString() === videoId);
        if (!videoToDelete) {
            return res.status(404).json({ success: false, error: "Video not found in album" });
        }
        
        const videoName = videoToDelete.videoPath.split('/').pop();
        const thumbnailName = videoToDelete.thumbnailPath.split('/').pop();
        const videoRes = await videoApi.delete(`${process.env.Video_API_BASE_URL}/chat/album/${user._id}/${videoName}`);
        const thumbnailRes = await videoApi.delete(`${process.env.Video_API_BASE_URL}/chat/album/${user._id}/${thumbnailName}`);
        if (!videoRes.data || !thumbnailRes.data) {
            logger.error(`Failed to delete video or thumbnail: ${videoName} or ${thumbnailName}`);
        }

        album.videos = album.videos.filter(video => video._id.toString() !== videoId);
        await album.save();
        
        return res.status(200).json({
            success: true,
            message: "Video deleted successfully",
            album: {
                name: album.albumName,
                videos: album.videos,
                createdAt: album.createdAt,
                updatedAt: album.updatedAt
            }
        });
    } catch (err) {
        logger.error('Error in deleteFromAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });        
    }
}

export const renameAlbum = async (req, res) => {
    try {
        const user = req.user;
        const { albumId } = req.params;
        const { newAlbumName } = req.body;
        if (!albumId || !newAlbumName) {
            return res.status(400).json({ success: false, error: "Album ID and new name are required" });
        }

        const existingAlbum = await Album.findOne({ albumName: newAlbumName.trim(), userId: user._id });
        if (existingAlbum) {
            return res.status(400).json({ success: false, error: "Album with this name already exists" });
        }

        const album = await Album.findOneAndUpdate(
            { _id: albumId, userId: user._id },
            { albumName: newAlbumName.trim() },
            { new: true }
        );
        if (!album) {
            return res.status(404).json({ success: false, error: "Album not found or unauthorized" });
        }

        const albums = await Album.find({ userId: user._id })
            .select("_id albumName createdAt updatedAt videos")
            .sort({ updatedAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Album renamed successfully",
            albums,
        });
    } catch (err) {
        logger.error('Error in renameAlbum controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getAllAlbums = async (req, res) => {
    try {
        const user = req.user;

        const albums = await Album.find({ userId: user._id })
        .select("_id albumName createdAt updatedAt videos")
        .sort({ updatedAt: 1 })
        .lean();

        return res.status(200).json({
            success: true,
            message: "Albums fetched successfully",
            albums,
        });
    } catch (err) {
        logger.error('Error in getAllAlbums controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const editVideoName = async (req, res) => {
    try {
        const { albumId, videoId } = req.params;
        const { newVideoName } = req.body;
        const user = req.user;

        if (!albumId || !videoId || !newVideoName) {
            return res.status(400).json({ success: false, error: "Album ID, Video ID and new name are required" });
        }

        const album = await Album.findOneAndUpdate(
            { _id: albumId, userId: user._id, "videos._id": videoId },
            { $set: { "videos.$.name": newVideoName.trim() } },
            { new: true }
        );

        if (!album) {
            return res.status(404).json({ success: false, error: "Album or video not found or unauthorized" });
        }

        return res.status(200).json({
            success: true,
            message: "Video name updated successfully",
            album: {
                name: album.albumName,
                videos: album.videos,
                createdAt: album.createdAt,
                updatedAt: album.updatedAt
            }
        });
    } catch (err) {
        logger.error('Error in editVideoName controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

