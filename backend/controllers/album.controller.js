import Album from "../Schema/album.schema";
import Prompt from "../Schema/prompt.schema";
import User from "../Schema/user.schema";
import { deleteFromR2 } from "../utils/deleteFromR2";

export const createAlbum = async (req, res) => {
    try {
        const user = req.user;
        const { albumName, videoUrls } = req.body;
        if (!albumName || !videoUrls || !Array.isArray(videoUrls)) {
            return res.status(400).json({ type:'error', error: "Album Name and Videos are required" });
        }

        const existingAlbum = await Album.findOne({ albumName: albumName.trim(), userId: user._id });
        if( existingAlbum ) {
            return res.status(400).json({ type:'error', error: "Album with this name already exists" });
        }

        const album = new Album({
            userId: user._id,
            albumName: albumName.trim(),
            videoPaths: videoUrls,
        });
        await album.save();
        await User.findByIdAndUpdate(user._id, 
            { $push: { albumIds: album._id } 
        });

        res.status(201).json({
            type: "success",
            message: "Album created successfully",
        });
    } catch (err) {
        console.error('Error in createAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export const addToAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { videoUrls } = req.body;
        const user = req.user;

        if (!albumId || !videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
            return res.status(400).json({ type:'error', error: "albumId and videoUrls are required" });
        }

        const album = await Album.findOne({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ type:'error', error: "Album not found or unauthorized" });
        }

        album.videoPaths.push(...videoUrls);
        await album.save();

        return res.status(200).json({
            type: "success",
            message: "Videos uploaded successfully",
        });

    } catch (err) {
        console.error('Error in uploadToAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export const getAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const user = req.user;
        if (!albumId) {
            return res.status(400).json({ type:'error', error: "Album ID is required" });
        }
        const album = await Album.findOne({ _id: albumId, userId: user._id}).lean();
        if (!album) {
            return res.status(404).json({ type:'error', error: "Album not found or unauthorized" });
        }
        return res.status(200).json({
            type: "success",
            message: "Album retrieved successfully",
            album: {
                name: album.albumName,
                videos: album.videoPaths,
                createdAt: album.createdAt,
                updatedAt: album.updatedAt
            }
        });
    } catch (err) {
        console.error('Error in getAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export const deleteAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const user = req.user;
        if (!albumId) {
            return res.status(400).json({ type:'error', error: "Album ID is required" });
        }

        const album = await Album.findOneAndDelete({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ type:'error', error: "Album not found or unauthorized" });
        }

        for (const videoPath of album.videoPaths) {
            const exists = await Prompt.findOne({ videoPath });
            if(!exists){
                await deleteFromR2(videoPath);
                console.log(`Deleted video from R2: ${videoPath}`);
            }
        }

        await User.findByIdAndUpdate(user._id,
            { $pull: { albumIds: album._id } }
        );

        return res.status(200).json({
            type: "success",
            message: "Album deleted successfully",
        });
    } catch (err) {
        console.error('Error in deleteAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export const deleteFromAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { videoPaths } = req.body;
        const user = req.user;
        if (!albumId || !videoPaths || !Array.isArray(videoUrls) || videoUrls.length === 0) {
            return res.status(400).json({ type:'error', error: "albumId and videoUrls are required" });
        }
        const album = await Album.findOne({ _id: albumId, userId: user._id });
        if (!album) {
            return res.status(404).json({ type:'error', error: "Album not found or unauthorized" });
        }
        for (const videoPath of videoPaths) {
            if(album.videoPaths.includes(videoPath)){
                album.videoPaths = album.videoPaths.filter(path => path !== videoPath);
                const exists = await Prompt.findOne({ videoPath });
                if(!exists){
                    await deleteFromR2(videoPath);
                    console.log(`Deleted video from R2: ${videoPath}`);
                }
            }
        }
        await album.save();
        return res.status(200).json({
            type: "success",
            message: "Videos deleted successfully",
        });
    } catch (err) {
        console.error('Error in deleteFromAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });        
    }
}

export const renameAlbum = async (req, res) => {
    try {
        const user = req.user;
        const { albumId } = req.params;
        const { newAlbumName } = req.body;
        if (!albumId || !newAlbumName) {
            return res.status(400).json({ type:'error', error: "Album ID and new name are required" });
        }

        const existingAlbum = await Album.findOne({ albumName: newAlbumName.trim(), userId: user._id });
        if (existingAlbum) {
            return res.status(400).json({ type:'error', error: "Album with this name already exists" });
        }

        const album = await Album.findOneAndUpdate(
            { _id: albumId, userId: user._id },
            { albumName: newAlbumName.trim() },
            { new: true }
        );
        if (!album) {
            return res.status(404).json({ type:'error', error: "Album not found or unauthorized" });
        }

        return res.status(200).json({
            type: "success",
            message: "Album renamed successfully",
        });
    } catch (err) {
        console.error('Error in renameAlbum controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export const getAllAlbums = async (req, res) => {
    try {
        const user = req.user;

        const albums = await Album.find({ userId: user._id })
        .select("_id albumName createdAt updatedAt videoPaths")
        .sort({ updatedAt: -1 })
        .lean();

        return res.status(200).json({
            type: "success",
            message: "Albums fetched successfully",
            albums,
        });
    } catch (err) {
        console.error('Error in getAllAlbums controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

