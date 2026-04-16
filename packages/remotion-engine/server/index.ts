import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ProjectStateSchema } from '@artisan/types';

const app = express();
app.use(express.json({ limit: '50mb' }));

// Global lock variable to block multiple concurrent renders
let isRendering = false;

app.post('/api/render', async (req, res) => {
  // Check the global lock
  if (isRendering) {
    return res.status(429).json({ error: 'System is currently rendering a video. Please wait.' });
  }

  try {
    // Acquire the lock
    isRendering = true;

    // Validate the incoming payload using Zod schema
    const projectState = ProjectStateSchema.parse(req.body);

    const tmpPath = path.join(process.cwd(), 'dummy', 'render_props.json');
    const outPath = path.join(process.cwd(), 'out.mp4');
    
    // Ensure the dummy dir exists
    if (!fs.existsSync(path.dirname(tmpPath))) {
        fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
    }

    // Write the payload to a temp file
    fs.writeFileSync(tmpPath, JSON.stringify(projectState, null, 2));

    console.log(`Starting render process for project: ${projectState.projectId}`);
    
    // spawn the remotion CLI process
    // command: npx remotion render src/index.tsx MyVideo out.mp4 --props=/tmp/render_props.json
    const cliProcess = spawn('npx', [
        'remotion', 'render', 'src/index.tsx', 'MyVideo', outPath, `--props=${tmpPath}`
    ], { stdio: 'inherit' });

    cliProcess.on('close', (code) => {
      // Release the lock
      isRendering = false;
      
      if (code === 0) {
        console.log(`Render completed successfully. Output saved to: ${outPath}`);
        res.status(200).json({ success: true, url: `/play/${path.basename(outPath)}` });
      } else {
        console.error(`Remotion render process exited with code ${code}`);
        res.status(500).json({ error: 'Render process failed' });
      }
    });

    cliProcess.on('error', (err) => {
        isRendering = false;
        console.error('Failed to spawn render process.', err);
        res.status(500).json({ error: 'Failed to spawn render process', details: err.message });
    });

  } catch (err: any) {
    // Release the lock on exception
    isRendering = false;
    console.error('Error in /api/render:', err);
    res.status(400).json({ error: 'Invalid payload or server error', details: err.errors || err.message });
  }
});

// Serve the rendered video statically if needed
app.use('/play', express.static(process.cwd()));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Remotion Render API is running on port ${PORT}`);
});
