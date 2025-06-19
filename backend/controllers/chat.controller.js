import Album from "../Schema/album.schema";
import Chat from "../Schema/chat.schema";
import Prompt from "../Schema/prompt.schema";
import User from "../Schema/user.schema";
import { deleteFromR2 } from "../utils/deleteFromR2";

const MaxChatLimit = 5;

export const createChat = async (req, res) => {
  try {
    const user = req.user;
    const title = 'New Chat';
    
    const userWithChats = await User.findById(user._id).populate({
      path: 'chatIds',
      select: 'updatedAt',
      options: { sort: { updatedAt: 1 }}
    });
    const existingChats = userWithChats.chatIds || [];

    const videoPaths = []
    let isDeleted = false;
    if( existingChats.length >= MaxChatLimit ) {
      const oldestChatId = existingChats[0];
      const oldestChat = await Chat.findById(oldestChatId).populate('prompts');
      if( oldestChat && oldestChat.prompts.length > 0){
        for (const prompt of oldestChat.prompts){
          if (prompt.videoPath) {
            videoPaths.push(prompt.videoPath);
          }
          await Prompt.findByIdAndDelete(prompt._id);
        }
      }
      await Chat.findByIdAndDelete(oldestChatId);
      await User.findByIdAndUpdate(user._id, 
        { $pull: { chatIds: oldestChatId } 
      });
      isDeleted = true;
      await Promise.all(
        videoPaths.map(async (videoPath) => {
          const exists = await Album.exists({
            userId: user._id,
            videoPaths: videoPath 
          });

          if (!exists) {
            await deleteFromR2(videoPath);
          }
        })
      );
    }

    const newChat = new Chat({
      userId: user._id,
      title,
      prompts: []
    });
    await newChat.save();
    await User.findByIdAndUpdate(user._id, 
      { $push: { chatIds: newChat._id } 
    });

    res.status(201).json({
      type: isDeleted ? "chat_replaced" : "success",
      message: "Chat created successfully",
      chat: newChat,
    });
  } catch (err) {
    console.error('Error in createChat controller:', err);
    return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
  }
}

export const getChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ type: 'error', error: 'Chat ID is required' });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: user._id}).populate({
      path: 'prompts',
      select: 'videoPath prompt createdAt updatedAt',
      options: { sort: { createdAt: 1 }}
    }).lean();
    if (!chat) {
      return res.status(404).json({ type: 'error', error: 'Chat not found or unauthorized' });
    }

    return res.status(200).json({
      type: "success",
      message: "Chat retrieved successfully",
      chat,
    });
  } catch (err) {
    console.error('Error in getChats controller:', err);
    return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
  }
}

export const getAllChats = async (req, res) => {
  try {
    const user = req.user;

    const chats = await Chat.find({ userId: user._id })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      type: "success",
      message: "Chats retrieved successfully",
      chats,
    });
  } catch (err) {
    console.error('Error in getAllChats controller:', err);
    return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
  }
}

export const deleteChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ type: 'error', error: 'Chat ID is required' });
    }

    const chat  = await Chat.findOne({_id: chatId, userId: user._id}).populate('prompts');
    if (!chat) {
      return res.status(404).json({ type: 'error', error: 'Chat not found or unauthorized' });
    }

    const videoPathsToCheck = chat.prompts.map(p => p.videoPath).filter(Boolean);
    await Prompt.deleteMany({ _id: { $in: chat.prompts.map(p => p._id) } });
    await Chat.findByIdAndDelete(chatId);
    await User.findByIdAndUpdate(user._id, { $pull: { chatIds: chat._id } });

    const deletionChecks = videoPathsToCheck.map(async (videoPath) => {
      const existsInAlbum = await Album.exists({ userId: user._id, videoPaths: videoPath });
      if (!existsInAlbum) {
        await deleteFromR2(videoPath);
      }
    });
    await Promise.all(deletionChecks);

    return res.status(200).json({
      type: "success",
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error('Error in deleteChat controller:', err);
    return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
  }
}

export const renameChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    const { title } = req.body;
    if (!chatId || !title) {
      return res.status(400).json({ type: 'error', error: 'Chat ID and title are required' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: user._id },
      { title: newTitle },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ type: 'error', error: 'Chat not found or unauthorized' });
    }

    return res.status(200).json({
      type: "success",
      message: "Chat renamed successfully",
      chat
    });
    
  } catch (err) {
    console.error('Error in renameChat controller:', err);
    return res.status(500).json({ type: 'error', error: 'Internal Server Error' });
  }
}