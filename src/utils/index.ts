import moment from 'moment';

/**
 * Убираем лишние теги из описания проекта
 * @param html
 * @returns {string}
 */
export const flStrip = (html: string): string => {
	let res = html.toString().replace(/<br>/gim, '\n');
	res = res.replace(/<noindex>/gim, '');
	res = res.replace(/<\/noindex>/gim, '');
	res = res.replace(/&nbsp;/gim, ' ');
	res = res.replace(/<a(.*?)href="(.*?)"(.*?)>(.*?)<\/a>/gim, (a, b, c, d, e) => {
		return c;
	});
	return res;
};

/**
 * Преобразуем в дату из FL
 * @param dstring
 * @returns {*}
 */
export const fltoDate = (dstring: string): Date | null => {
	const parts = dstring.split('|');
	if (parts.length < 2) return null;
	const dt = parts[0].trim();
	const tparts = parts[1].trim().split(' ');
	const tt = tparts[0].trim();

	return moment(dt + ' ' + tt, 'DD.MM.YYYY HH:mm').toDate();
};

export const randomInteger = (min: number, max: number): number => {
	let rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
};
