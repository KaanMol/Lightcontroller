const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    reboot: async () => { await exec("reboot"); },
    setHostname: async () => { await exec(`hostname ${hostname}`); },
    getHostname: async () => (await exec(`hostname`)).stdout,
    getIP: async () => (await exec(`hostname -I`)).stdout.split(" ")[0],
}