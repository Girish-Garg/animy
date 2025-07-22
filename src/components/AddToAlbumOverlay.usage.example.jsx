// Example usage of AddToAlbumOverlay component
// This shows how to integrate the component into your application

import React, { useState } from 'react';
import AddToAlbumOverlay from './AddToAlbumOverlay';

const ExampleUsage = () => {
  const [showAddToAlbum, setShowAddToAlbum] = useState(false);
  
  // Example video data that would come from your chat/generation system
  const exampleVideoData = {
    videoPath: '/path/to/generated/video.mp4',
    thumbnailPath: '/path/to/generated/thumbnail.jpg',
    chatId: 'chat_123456'
  };

  const handleVideoAdded = (responseData) => {
    console.log('Video added successfully:', responseData);
    // Handle the response data
    // You might want to refresh a list, navigate to the album, etc.
  };

  return (
    <div>
      {/* Your existing UI */}
      <button 
        onClick={() => setShowAddToAlbum(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Video to Album
      </button>

      {/* AddToAlbumOverlay */}
      <AddToAlbumOverlay
        isOpen={showAddToAlbum}
        onClose={() => setShowAddToAlbum(false)}
        onVideoAdded={handleVideoAdded}
        videoPath={exampleVideoData.videoPath}
        thumbnailPath={exampleVideoData.thumbnailPath}
        chatId={exampleVideoData.chatId}
      />
    </div>
  );
};

export default ExampleUsage;

/*
API ENDPOINT EXPECTED:
POST /album/:albumId/video

Request Body:
{
  "name": "User entered video name",
  "videoPath": "path/to/video.mp4",
  "thumbnailPath": "path/to/thumbnail.jpg", 
  "chatId": "chat_123456"
}

Expected Response:
{
  "success": true,
  "message": "Video added to album successfully",
  "video": {
    "_id": "video_id",
    "name": "User entered video name", 
    "videoPath": "path/to/video.mp4",
    "thumbnailPath": "path/to/thumbnail.jpg",
    "chatId": "chat_123456"
  },
  "album": {
    "name": "Album Name",
    "videos": [...], // Updated list of videos in the album
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
*/
