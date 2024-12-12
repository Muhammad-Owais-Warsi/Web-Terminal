import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from "cors";
import path from 'path';
import pty from "node-pty";
import os from "os";

import CreateContainer from './container.js';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

const frontendPath = path.join(process.cwd(), 'frontend');
app.use(express.static(frontendPath));

function OutputProcessor(output) {
    return output.toString();
}



io.on('connection', (socket) => {
    let container = null;
    let ptyProcess = null;
    let lastCommand = "";

    console.log(`${socket.id} connected`);


    socket.emit('socket-id');

    socket.on('create-container', async () => {
        try {

            container = await CreateContainer();
     
            await container.start();
            console.log(`Container created with ID: ${container.id} for ${socket.id}`);
            
            const dynamicPrompt = `user@${container.id}:\\w$ `;

            ptyProcess = pty.spawn('docker', ['exec', '-it', container?.id, 'sh'], {
                name: 'xterm-color',
                cols: 80,
                rows: 24,
                cwd: '/',
                env: {
                    ...process.env,
                    PS1: dynamicPrompt, // Set the prompt string here
                },
            });
      

            ptyProcess.onData((data) => {

            
 
                let processedOutput = OutputProcessor(data);
                
                
                processedOutput = processedOutput.slice(lastCommand.length,processedOutput.length-1);
                
                console.log("Received Data:", processedOutput);
                lastCommand = "";
            
                // Emit the processed output to the client
                socket.emit('output', processedOutput.trim());
            
      
            });
            
        } catch (error) {
            console.error("Error creating container or PTY process:", error);
            socket.emit('error', { message: 'Failed to initialize container or terminal' });

     
            if (container) {
                try {
                    await container.stop();
                    await container.remove();
                } catch (cleanupError) {
                    console.error("Error cleaning up container:", cleanupError);
                }
            }
            container = null;
            ptyProcess = null;
        }
    });





    socket.on('command', (data) => {
        if (!ptyProcess) {
            console.error("PTY process not initialized. Cannot process commands.");
            socket.emit('error', { message: 'Terminal not initialized. Please wait for confirmation.' });
            return;
        }

        // Write command to PTY process
        lastCommand = data;
        ptyProcess.write(`${data} \r`);
    });


    




    socket.on('disconnect', async () => {
        console.log(`${socket.id} disconnected`);

        // Cleanup PTY process
        if (ptyProcess) {
            ptyProcess.kill();
        }

        // Cleanup container
        if (container) {
            try {
                await container.stop();
                await container.remove();
                console.log(`Container for ${socket.id} removed`);
            } catch (error) {
                console.error("Error removing container:", error);
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
