import InitializeDocker from "./docker.js";

export default async function CreateContainer() {
    const docker = InitializeDocker();

    const container = await docker.createContainer({
        Image: 'linux-terminal', 
        Tty: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        Cmd: ['/bin/bash'],
    })    

    return container;
    

}