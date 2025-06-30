export const generateMockAlbumData = (count = 8) => {
  const videos = [];
  const videoTypes = ['atomicBomb.mp4', 'spirograph.mp4', 'tower.mp4', 'music.mp4', 'hinderburg.mp4', 'main.mp4'];
  
  for (let i = 0; i < count; i++) {
    const randomVideoIndex = Math.floor(Math.random() * videoTypes.length);
    videos.push({
      id: `video-${i}`,
      path: videoTypes[randomVideoIndex],
      title: `Amazing Scene ${i + 1}`,
      duration: '00:30',
      quality: 'HD'
    });
  }
  
  return {
    albumName: 'My Creative Album',
    videos,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

