import { socket } from "./socket.js";
import exec from "./exec.js";
import create from "./socket.js";

export const term = new Terminal({
    cursorBlink: true,
});
term.open(document.getElementById('terminal'));





let command = "";



term.onData(async (data) => {
    if(data === "\r" || data === "\n") {
        term.write("\r\n");
        command.length > 0 ? await exec(command) : term.write("\r\n");
        command = "";
    } else if(data === "\x7F") {    
        if(command.length > 0) {
            command = command.slice(0,-1);
            term.write("\b \b");
        }
    } else {
        command += data;
        term.write(data);
    }
});


socket.on('socket-id', async () => {
    create();
})



socket.on('output', (data) => {
    term.write(data); // Write data from the server to the terminal
   

    
});

