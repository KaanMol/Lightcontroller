const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("fs");

const utils = {
    setupAccessPoint: async () => {
        if (fs.existsSync('/etc/wpa_supplicant/wpa_supplicant.conf')) {
            await exec('mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.original')
        }
    
        if (fs.existsSync('/etc/dnsmasq.conf')) {
            await exec('mv /etc/dnsmasq.conf /etc/dnsmasq.conf.original');
        }
    
        await exec('cp /home/pi/lightcore/setup/configs/dnsmasq.conf /etc/')
        await exec('cp /home/pi/lightcore/setup/configs/hostapd.conf.nowpa /etc/hostapd/hostapd.conf')
    
        if (fs.existsSync('/etc/dhcpcd.conf')) {
            await exec('mv /etc/dhcpcd.conf /etc/dhcpcd.conf.original')
        }
        
        await exec('cp /home/pi/lightcore/setup/configs/dhcpcd.conf /etc/')
    
        if (!fs.existsSync('/etc/cron.lightcore')) {
            await exec('mkdir /etc/cron.lightcore')
    
            if (fs.existsSync('/etc/cron.lightcore/apclient_bootstrapper')) {
                await exec('rm /etc/cron.lightcore/apclient_bootstrapper')
            }
    
            await exec('echo "# LightCore Startup" >> /etc/crontab')
            await exec('echo "@reboot root run-parts /etc/cron.lightcore/" >> /etc/crontab')
        }
            
        await exec('cp /home/pi/lightcore/setup/configs/aphost_bootstrapper /etc/cron.lightcore')
        await exec('chmod +x /etc/cron.lightcore/aphost_bootstrapper')
    
        global.db.push("/system/setup/isAccessPoint", true);
        global.oled.write("Installatie \n\n AccessPoint gemaakt.\n Aan het herstarten...");
        await exec('reboot');
    },
    setupAPClient: async (ssid) => {
        await exec('rm /etc/cron.lightcore/aphost_bootstrapper')
        await exec('cp /home/pi/lightcore/setup/configs/apclient_bootstrapper /etc/cron.lightcore/')
        await exec('chmod +x /etc/cron.lightcore/apclient_bootstrapper')
        await exec('mv /etc/dnsmasq.conf.original /etc/dnsmasq.conf')
        await exec('mv /etc/dhcpcd.conf.original /etc/dhcpcd.conf')
        await exec('reboot')
    
        global.db.push("/system/setup", { isFinished: true, isAccessPoint: false });
        global.oled.write(`Installatie voltooid! \n Aan het verbinden met het ${ssid}`);
        await exec('reboot')
    },
    createWPASupplicant: async (ssid, wifi_key) => {
        global.db.push("/preferences/network", ssid)
    
        let passwordString = `psk="${wifi_key}"`;
    
        if (wifi_key === "") {
            passwordString = "key_mgmt=NONE";
        }
    
        const wpaSupplicant = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
    update_config=1
    network={
        ssid="${ssid}"
        ${passwordString}
    }`;
    
        fs.writeFileSync("wpa_supplicant.conf.tmp", wpaSupplicant);
        await exec("mv wpa_supplicant.conf.tmp /etc/wpa_supplicant/wpa_supplicant.conf");
    },
    scanWifiNetworks: async () => {
        const { stdout, stderr } = await exec("sudo iwlist wlan0 scan");
        const wifiScan = stdout.split("\n");
    
        let networks = [];
        let currentNetwork = 0;
        for (let i = 0; i < wifiScan.length; i++) {
            const curLine = wifiScan[i];
            if (curLine.includes("Cell")) {
                const parts = curLine.split(" ").filter(part => part);
                currentNetwork = Number(parts[1]) - 1;
                networks.push({});
                networks[currentNetwork].address = parts[4];
            }
            if (curLine.includes("Signal level")) {
                const parts = curLine.split("=");
                networks[currentNetwork].signalLevel = Number(parts[2].split(" ")[0]);
            }
            if (curLine.includes("ESSID")) {
                const parts = curLine.replace(/"/g,"").split(":");
                networks[currentNetwork].ssid = parts[1];
            }
            if (curLine.includes("Encryption key")) {
                const parts = curLine.split(":");
                networks[currentNetwork].encrypted = parts[1] === "on" ? true : false;
            }
        }
        networks = networks.filter(network => network.ssid)
        networks.sort((a, b) => b.signalLevel - a.signalLevel)
    
        return networks;
    }
};

const facade = {
    scanWifiNetworks: async () => [{ ssid: "LegitNetwork", encrypted: true, SignalLevel: -70 }, { ssid: "FBI Surveillance Van #14", encrypted: false, signalLevel: -40 }],
    createWPASupplicant: async (ssid, password) => console.log(`Create WPASupplicant: ${ssid}, ${password}`),
    setupAccessPoint: async () => console.log("Create AccessPoint and reboot"),
    setupAPClient: async () => console.log("Remove AccessPoint files and setup client"),
}

module.exports = global.db.getData("/system/isProduction") ? utils : facade;