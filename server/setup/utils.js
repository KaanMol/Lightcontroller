const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("fs");

async function setupAccessPoint() {
    await exec('mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.original')
    await exec('mv /etc/dnsmasq.conf /etc/dnsmasq.conf.original')
    await exec('cp /usr/lib/raspiwifi/reset_device/static_files/dnsmasq.conf /etc/')
    await exec('cp /usr/lib/raspiwifi/reset_device/static_files/hostapd.conf.nowpa /etc/hostapd/hostapd.conf')
    await exec('mv /etc/dhcpcd.conf /etc/dhcpcd.conf.original')
    await exec('cp /usr/lib/raspiwifi/reset_device/static_files/dhcpcd.conf /etc/');
    
    global.db.push("/system/setup/isAccessPoint", true);
    await exec('reboot');
}

async function setupAPClient() {
    await exec('rm -f /etc/raspiwifi/host_mode')
    await exec('rm /etc/cron.raspiwifi/aphost_bootstrapper')
    await exec('cp /usr/lib/raspiwifi/reset_device/static_files/apclient_bootstrapper /etc/cron.raspiwifi/')
    await exec('chmod +x /etc/cron.raspiwifi/apclient_bootstrapper')
    await exec('mv /etc/dnsmasq.conf.original /etc/dnsmasq.conf')
    await exec('mv /etc/dhcpcd.conf.original /etc/dhcpcd.conf')
    global.db.push("/system/setup/isFinished", true)
    await exec('reboot')
}

async function createWPASupplicant(ssid, wifi_key) {
    global.db.push("/system/wifi", { ssid, psk: wifi_key })

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
}

async function scanWifiNetworks() {
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

module.exports = {
    setupAPClient,
    setupAccessPoint,
    createWPASupplicant,
    scanWifiNetworks
}