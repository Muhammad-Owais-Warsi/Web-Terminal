
export const socket = io('https://web-terminal-nu.vercel.app/'); // Ensure the correct backend address is used

// Log connection status
socket.on('connect', () => {
    console.log('Connected to the server:', socket.id);
});

export default function create() {
    socket.emit('create-container');
    return ;
}