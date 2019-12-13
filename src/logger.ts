/* eslint-disable no-console */
const debug = (...args: any) => console.debug(...args);
const info = (...args: any) => console.log(...args);
const error = (...args: any) => console.error(...args);

export default {
	debug,
	info,
	error,
};
