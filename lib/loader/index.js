const { clear, update } = require('stdline');

const loader = [
	'◉○○○',
	'◉○○○',
	'○◉○○',
	'○○◉○',
	'○○○◉',
	'○○○◉',
	'○○◉○',
	'○◉○○',
];
let timer;

module.exports.loader = {
	start: function start(message, index = 0) {
		clearTimeout(timer);
		const graphics = loader[index];
		const next = index === loader.length - 1 ? 0 : index + 1;
		update([ graphics, message ].join(' '));
		timer = setTimeout(() => start(message, next), 50);
	},
	end: function end() {
		clearTimeout(timer);
		clear();
	},
};
