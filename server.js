
const dgram = require('dgram');
const socket = dgram.createSocket({type:'udp4', reuseAddr:true});
const _ = require('lodash');
const pfio = require('piface');

const MULTICAST_ADDR = '233.255.47.199';
const PORT = 8444;

socket.on('error', (err) => {
	console.log('server error', err);
	socket.close();
});

socket.on('message', (msg, rinfo) => {
	const cmd = _.trim(msg).split(' ');
	console.log(`got: %s`, cmd);
	if (cmd && cmd.length > 0 && cmd[0] == 'open') {
		open(cmd[1], cmd[2]);
	} else if (cmd && cmd.length > 0 && cmd[0] == 'close') {
		close(cmd[1], cmd[2]);
	}
});

socket.on('listening', () => {
	const addr = socket.address();
	console.log(`listening on ${addr.address}:${addr.port}`);
});

pfio.init();
socket.bind(PORT);


function open(relay, duration) {
	console.log(`Open ${relay}`);
	pfio.digital_write(relay, 1);

	if (duration) {
		return setTimeout(() => {
			close(relay);
		}, duration);
	}
}

function close(relay, duration) {
	console.log(`Closing ${relay}`);
	pfio.digital_write(relay, 0);

        if (duration) {
                return setTimeout(() => {
                        open(relay);
                }, duration);
        }
}

let prev_value = 0;
function read() {
	let r = pfio.read_input();
	if (r != prev_value) {
		prev_value = r;
		//socket.send(r, 0, );
		console.log(r);
		if (1 == r) {
			open(0, 85);
		} else if (2 == r) {
			open(1, 50);
		} else if (4 == r) {
                        open(0);
                } else if (8 == r) {
                        open(1);
                } else if (0 == r) {
                        close(1);
			close(0);
                }


	}
}

setInterval(read, 100);

module.exports = {
	open, close
}
