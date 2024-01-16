import { clear, update } from "stdline";

const states = ["◉○○○", "◉○○○", "○◉○○", "○○◉○", "○○○◉", "○○○◉", "○○◉○", "○◉○○"];
let timer;

export const loader = {
	start: function start(message, index = 0) {
		clearTimeout(timer);
		const graphics = states[index];
		const next = index === states.length - 1 ? 0 : index + 1;
		update([graphics, message].join(" "));
		timer = setTimeout(() => start(message, next), 50);
	},
	end: function end() {
		clearTimeout(timer);
		clear();
	},
};
