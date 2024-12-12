import Docker from "dockerode";

export default  function InitializeDocker() {
    var docker =  new Docker();

    return docker;
}