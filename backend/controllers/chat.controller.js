import axios from "axios";
import Chat from "../schema/chat.schema.js";
import Prompt from "../schema/prompt.schema.js";
import User from "../schema/user.schema.js";

const MaxChatLimit = 5;

export const createChat = async (req, res) => {
  try {
    const user = req.user;
    const title = req.validatedData?.body?.title || 'New Chat';
    const prompt = req.validatedData?.body?.prompt;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required' });
    }
    
    const userWithChats = await User.findById(user._id).populate({
      path: 'chatIds',
      select: 'updatedAt',
      options: { sort: { updatedAt: 1 }}
    });
    const existingChats = userWithChats.chatIds || [];

    let isDeleted = false;
    if( existingChats.length >= MaxChatLimit ) {
      const oldestChatId = existingChats[0];
      const oldestChat = await Chat.findById(oldestChatId).populate('prompts');
      if( oldestChat && oldestChat.prompts.length > 0){
        for (const prompt of oldestChat.prompts){
          await Prompt.findByIdAndDelete(prompt._id);
        }
      }
      await Chat.findByIdAndDelete(oldestChatId);
      await User.findByIdAndUpdate(user._id, 
        { $pull: { chatIds: oldestChatId } 
      });

      const chatDeletionResponse = await axios.delete(`${process.env.Video_API_BASE_URL}/chat/${user._id}/${oldestChatId}`);
      if (!chatDeletionResponse.data.success) {
        return res.status(500).json({ success: false, error: 'Failed to delete oldest chat' });
      }
      isDeleted = true;
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

    const GenerateResponse = await axios.post(`${process.env.Video_API_BASE_URL}/video/generate`, {
      prompt,
      userId: user._id,
      chatId: newChat._id,
      filename : 'video'
    });

    if (!GenerateResponse.data.success) {
      return res.status(500).json({ success: false, error: 'Failed to generate video' });
    }

    const newPrompt = await Prompt.create({
      chatId: newChat._id,
      prompt,
      status: "processing"
    });

    await Chat.findByIdAndUpdate(newChat._id, {
      $push: { prompts: newPrompt },
      $set: { lastUpdated: new Date() }
    });

    res.status(201).json({
      type: isDeleted ? "chat_replaced" : "success",
      message: "Chat created successfully",
      chat: newChat,
      promptId: newPrompt._id
    });
    
  } catch (err) {
    console.error('Error in createChat controller:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export const getChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, error: 'Chat ID is required' });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: user._id}).populate({
      path: 'prompts',
      select: 'video prompt createdAt updatedAt',
      options: { sort: { createdAt: 1 }}
    }).lean();
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: "Chat retrieved successfully",
      chat,
    });
  } catch (err) {
    console.error('Error in getChats controller:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
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
      success: true,
      message: "Chats retrieved successfully",
      chats,
    });
  } catch (err) {
    console.error('Error in getAllChats controller:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export const deleteChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ success: false, error: 'Chat ID is required' });
    }

    const chat  = await Chat.findOne({_id: chatId, userId: user._id}).populate('prompts');
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found or unauthorized' });
    }
    
    await Prompt.deleteMany({ _id: { $in: chat.prompts.map(p => p._id) } });
    await Chat.findByIdAndDelete(chatId);
    await User.findByIdAndUpdate(user._id, { $pull: { chatIds: chat._id } });

    const chatDeletionResponse = await axios.delete(`${process.env.Video_API_BASE_URL}/chat/${user._id}/${chatId}`);

    if (!chatDeletionResponse.data.success) {
      return res.status(500).json({ success: false, error: 'Failed to delete chat from external service' });
    }

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error('Error in deleteChat controller:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export const renameChat = async (req, res) => {
  try {
    const user = req.user;
    const { chatId } = req.params;
    const { title } = req.body;
    if (!chatId || !title) {
      return res.status(400).json({ success: false, error: 'Chat ID and title are required' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: user._id },
      { title: title },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: "Chat renamed successfully",
      chat
    });
    
  } catch (err) {
    console.error('Error in renameChat controller:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}