import { socket } from "./socket.js"

export default async function exec(command) {

    socket.emit('command',command);

}