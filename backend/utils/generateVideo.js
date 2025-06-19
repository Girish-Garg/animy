import fs from 'fs';
import path from 'path';
import socketIo from 'socket.io-client';

// Configuration - ideally move to environment variables
const config = {
  baseUrl: process.env.MY_API_URL || 'https://testingmanim-09b10fcedbd0.herokuapp.com',
  timeouts: {
    fetch: 2500000, // 41.6 minutes
    download: 180000, // 3 minutes
    polling: 28000, // 28 seconds
  },
  maxRetries: 3,
};

/**
 * Fetch with timeout and retry capability
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} retries - Number of retries left
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithTimeout(url, options = {}, timeout = config.timeouts.fetch, retries = config.maxRetries) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0) {
      console.log(`Request failed, retrying... (${retries} retries left)`);
      // Exponential backoff
      const delay = 1000 * Math.pow(2, config.maxRetries - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Submit a job to the animation server
 * @param {string} prompt - The animation prompt
 * @param {string} filename - Output filename
 * @param {Array} history - Chat history for context
 * @returns {Promise<string|null>} - Request ID or null if failed
 */
async function submitJob(prompt, filename, history = []) {
  try {
    const response = await fetchWithTimeout(
      `${config.baseUrl}/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, filename, history })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.requestId;
  } catch (error) {
    console.error('Error submitting job:', error);
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    }
    return null;
  }
}

/**
 * Check the status of a job
 * @param {string} requestId - The request ID
 * @returns {Promise<Object>} - Status object
 */
async function checkStatus(requestId) {
  try {
    const response = await fetchWithTimeout(`${config.baseUrl}/status/${requestId}`);
    
    if (!response.ok) {
      throw new Error(`Status check failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    }
    return { status: 'error', message: error.message };
  }
}

/**
 * Download the generated video
 * @param {string} requestId - The request ID
 * @param {string} filename - Output filename
 * @returns {Promise<boolean>} - Success or failure
 */
async function downloadVideo(requestId, filename) {
  try {
    console.log(`Downloading from: ${config.baseUrl}/video/${requestId}`);
    const response = await fetchWithTimeout(
      `${config.baseUrl}/video/${requestId}`,
      {},
      config.timeouts.download
    );
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const outputPath = path.resolve(process.cwd(), filename);
    
    try {
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`File saved successfully to: ${outputPath}`);
      return true;
    } catch (fileError) {
      console.error('Error writing file to disk:', fileError);
      return false;
    }
  } catch (error) {
    console.error('Error downloading video:', error);
    if (error.name === 'AbortError') {
      console.error('Download timed out');
    }
    return false;
  }
}

/**
 * Set up socket connection for real-time updates
 * @param {string} requestId - The request ID
 * @param {function} onProgress - Progress callback function
 * @returns {Object} - Socket connection and cleanup function
 */
function setupSocketConnection(requestId, onProgress) {
  const socket = socketIo(config.baseUrl);
  let connected = false;
  
  socket.on('connect', () => {
    connected = true;
    console.log('WebSocket connected - receiving real-time updates');
    socket.emit('subscribe', requestId);
  });
  
  socket.on('connect_error', (error) => {
    console.log('WebSocket connection error:', error.message);
    console.log('Falling back to polling for updates...');
  });
  
  socket.on('status_update', (data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] Status: ${data.status} - ${data.message}`);
    
    if (data.errorDetails) {
      console.log('Error details:', data.errorDetails);
    }
    
    if (data.retryCount) {
      console.log(`Fix attempt: ${data.retryCount}/${data.maxRetries || config.maxRetries}`);
    }
    
    if (typeof onProgress === 'function') {
      onProgress({
        status: data.status,
        message: data.message,
        timestamp,
        progress: data.progress,
        errorDetails: data.errorDetails
      });
    }
  });

  return {
    socket,
    isConnected: () => connected,
    disconnect: () => {
      if (socket.connected) {
        socket.disconnect();
        console.log('WebSocket disconnected');
      }
    }
  };
}

/**
 * Generate a video animation from a prompt
 * @param {string} prompt - The animation prompt
 * @param {string} filename - Output filename
 * @param {Array} history - Chat history for context
 * @param {function} onProgress - Optional progress callback function
 * @returns {Promise<{success: boolean, filePath: string|null, error: string|null}>} - Result object
 */
async function generate(prompt, filename, history = [], onProgress) {
  console.log('Submitting animation video request...');
  
  // Ensure filename has .mp4 extension
  if (!filename.toLowerCase().endsWith('.mp4')) {
    filename = `${filename}.mp4`;
  }
  
  try {
    const requestId = await submitJob(prompt, filename, history);
    
    if (!requestId) {
      return { 
        success: false, 
        filePath: null, 
        error: 'Failed to get requestId from server' 
      };
    }
    
    console.log(`Request ID: ${requestId}`);
    
    // Set up socket connection for real-time updates
    const { socket, isConnected, disconnect } = setupSocketConnection(requestId, onProgress);
    
    // Poll for status updates
    let status = 'queued';
    let lastProgressUpdate = Date.now();
    let retryCount = 0;
    
    while (status !== 'completed' && status !== 'failed') {
      console.log('Checking status via HTTP...');
      const response = await checkStatus(requestId);
      status = response.status;
      
      const currentTime = Date.now();
      const timeSinceLastUpdate = currentTime - lastProgressUpdate;
      
      console.log(`Current status: ${status}`);
      
      // Report progress
      if (typeof onProgress === 'function') {
        onProgress({
          status,
          message: response.message || `Current status: ${status}`,
          timestamp: new Date().toLocaleTimeString(),
          progress: response.progress
        });
      }
      
      // Handle stalled jobs
      if (timeSinceLastUpdate > config.timeouts.polling * 3 && status === 'processing') {
        console.warn(`No progress updates in ${Math.round(timeSinceLastUpdate/1000)} seconds`);
        
        if (retryCount < config.maxRetries) {
          retryCount++;
          console.log(`Attempting recovery... (${retryCount}/${config.maxRetries})`);
          // Could implement recovery logic here (e.g., ping a different endpoint)
        }
      }
      
      lastProgressUpdate = currentTime;
      
      if (status !== 'completed' && status !== 'failed') {
        console.log(`Waiting ${config.timeouts.polling/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.timeouts.polling));
      }
    }
    
    // Clean up socket connection
    disconnect();
    
    // Handle completion
    if (status === 'completed') {
      console.log('Downloading video...');
      const outputPath = path.resolve(process.cwd(), filename);
      console.log(`Will save video to: ${outputPath}`);
      
      const success = await downloadVideo(requestId, filename);
      if (success) {
        console.log(`Video saved successfully to ${outputPath}`);
        return {
          success: true,
          filePath: outputPath,
          error: null
        };
      } else {
        const error = 'Video download failed';
        console.error(error);
        return {
          success: false,
          filePath: null,
          error
        };
      }
    } else {
      const error = 'Video generation failed';
      console.error(error);
      return {
        success: false,
        filePath: null,
        error
      };
    }
  } catch (error) {
    console.error('Unexpected error during video generation:', error);
    return {
      success: false,
      filePath: null,
      error: error.message || 'Unknown error'
    };
  }
}

module.exports = generate;