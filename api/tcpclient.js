var net = require('net');
// var port = 3000;
// var host = '10.0.3.102';
// //var command = '*001001002,S004,002,0,000#';
// var command = '*001001002,R000#';
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }

exports.tcpClient = function connectToServer(port, ip, command) {
    return new Promise((resolve, reject) =>{

        var conn = net.createConnection(port, ip);
        var completeData = '';
        conn.on('connect', function () {
            console.log('COMMAND : ',command);
            conn.write(command);
        });
        
        conn.on('error', (error) => {
            console.log('Error : ' + error);
            reject(0);
        });
          
        conn.on('data', function (data) {
            var read = data.toString();
            // console.log('RESPONSE : ', read);
            completeData += read;
            if (completeData.match(/#/g)) {
                // console.log('RESPONSE : ', completeData.match(/#/g), completeData);
                resolve(completeData);
                conn.end();
                setTimeout(()=>{
                    conn.destroy();
                },3000);
            }
        });        
    });   
}
