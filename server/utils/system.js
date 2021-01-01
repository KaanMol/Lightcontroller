const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("fs");

const facade = {
    reboot: async () => { console.log("Rebooting"); },
    setHostname: async (hostname) => { console.log(`New hostname: ${hostname}`) },
    getHostname: async () => { return "DevelopmentMachine" },
    getIP: async () => { return "192.168.1.1" },
    reset: async ({ scenes, scene, theme }) => { 
        if (!scenes) {
            console.log("Removing scenes")
        }

        if (!scene) {
            console.log("Removing scene defaults")
        }

        if (!theme) {
            console.log("Removing theme")
        }

        console.log("Reset now");
    }
};

const system = {
    reboot: async () => { await exec("reboot"); },
    setHostname: async (hostname) => { await exec(`sudo hostnamectl set-hostname ${hostname}`); },
    getHostname: async () => (await exec(`hostname`)).stdout,
    getIP: async () => (await exec(`hostname -I`)).stdout.split(" ")[0],
    reset: async function ({ scenes, scene, theme }) { 
        if (!scenes) {
            if (fs.existsSync('/home/pi/lightcore/scenes.json')) {
                await exec('rm /home/pi/lightcore/scenes.json')
            }
        }

        if (fs.existsSync('/home/pi/lightcore/persist')) {
            await exec('rm -r /home/pi/lightcore/persist')
        }

        if (!scene) {
            global.db.push("/preferences/scene", {
                background: "DIMIGO",
                text: "white"
            })
        }

        if (!theme) {
            global.db.push("/preferences/ui", {
                type: "gradient",
                option: "Shifter",
                theme: "auto"
            })
        }

        await this.setHostname("luma");
        global.db.push("/system/setup/isFinished", false);
        await this.reboot();
    }
}

module.exports = global.db.getData("/system/isProduction") ? system : facade;