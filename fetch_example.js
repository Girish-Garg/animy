// Fetch API version of the same functionality with timeouts

// Helper function to create fetch requests with timeout
async function fetchWithTimeout(url, options = {}, timeout = 250000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);
  return response;
}

// Step 1: Submit a job
async function submitJob(prompt, filename) {
  try {
    const response = await fetchWithTimeout(
      'https://testingmanim-09b10fcedbd0.herokuapp.com/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, filename })
      }
    );
    
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

// Step 2: Check status
async function checkStatus(requestId) {
  try {
    const response = await fetchWithTimeout(
      `https://testingmanim-09b10fcedbd0.herokuapp.com/status/${requestId}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    }
    return { status: 'error' };
  }
}

// Step 3: Download video
async function downloadVideo(requestId, filename) {
  try {
    console.log(`Downloading from: https://testingmanim-09b10fcedbd0.herokuapp.com/video/${requestId}`);
    const response = await fetchWithTimeout(
      `https://testingmanim-09b10fcedbd0.herokuapp.com/video/${requestId}`,
      {},
      180000 
    );
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      return false;
    }
    
    // For Node.js:
    const buffer = await response.arrayBuffer();
    try {
      fs.writeFileSync(filename, Buffer.from(buffer));
      console.log(`File saved successfully to: ${process.cwd()}/${filename}`);
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

import fs from 'fs';

async function generateDockerExplainer() {
  console.log('Submitting Docker explainer video request...');
  const requestId = await submitJob('cut a circle in 50 or more parts and the sectors/cone like shaple which will be made join then to form a rectange like structure deriving area of circle', 'circle');
  
  if (!requestId) return;
  console.log(`Request ID: ${requestId}`);
  
  // Poll for status
  let status = 'queued';
  while (status !== 'completed' && status !== 'failed') {
    console.log('Checking status...');
    const response = await checkStatus(requestId);
    status = response.status;
    console.log(`Current status: ${status}`);
    
    if (status !== 'completed' && status !== 'failed') {
      console.log('Waiting 28 seconds...');
      await new Promise(resolve => setTimeout(resolve, 28000));
    }
  }
  
  if (status === 'completed') {
    console.log('Downloading video...');
    const outputPath = `${process.cwd()}/hinderburg.mp4`;
    console.log(`Will save video to: ${outputPath}`);
    const success = await downloadVideo(requestId, 'hinderburg.mp4');
    if (success) {
      console.log(`Video saved as hinderburg.mp4 in ${process.cwd()}`);
    } else {
      console.log('Video download failed');
    }
  } else {
    console.log('Video generation failed');
  }
}

generateDockerExplainer();
