var i2c = require('i2c-bus'),
  i2cBus = i2c.openSync(1),
  oled = require('oled-i2c-bus');
  var Wifi = require('rpi-wifi-connection');
  var wifi = new Wifi();
  var font = require('oled-font-5x7');


var opts = {
  width: 128,
  height: 64,
  address: 0x3C
};
 
var oled = new oled(i2cBus, opts);

function writeOled(connection) {
  oled.clearDisplay();
  oled.setCursor(1, 1);
  oled.writeString(font, 1, `Verbonden met: ${connection.ssid}. \n Bereikbaar op: http://${connection.ip_address}`, 1, true);
}
  


wifi.getStatus().then((status) => {
  writeOled(status);
});


 
