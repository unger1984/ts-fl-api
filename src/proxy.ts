import puppeteer from 'puppeteer';

import logger from './logger';

const GetProxy = async (): Promise<string[]> => {
	let browser = null;
	let page = null;
	const res = [];
	try {
		browser = await puppeteer.launch({ args: ['--no-sandbox'] });
		page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 920 });
		await page.setExtraHTTPHeaders({
			'Upgrade-Insecure-Requests': '1',
			Referer: 'https://hidemyna.me/',
		});
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
		);
		await page.goto('https://hidemyna.me/ru/proxy-list/?maxtime=700&type=s#list');
		// await page.screenshot({path: '/tmp/test.png'});
		await page.waitFor(1000 * 15);
		// await page.screenshot({path: 'screenshots/test.png'});
		const table = await page.$('div.table_block table');
		if (table) {
			const trs = await table.$$('tr');
			for (const index in trs) {
				const tr = trs[index];
				const tds = await tr.$$('td');
				// console.log("cols",tds.length)
				if (tds.length <= 0) {
					continue;
				}
				const ip: string = (await (await tds[0].getProperty('innerText')).jsonValue()) as string;
				const port: string = (await (await tds[1].getProperty('innerText')).jsonValue()) as string;
				if (ip && port) {
					if (ip.toLowerCase() === 'ip адрес' || isNaN(parseInt(port))) {
						continue;
					}
					res.push(`${ip}:${port}`);
				}
			}
		}
	} catch (err) {
		logger.error(err);
		throw err;
	}
	if (browser) {
		await browser.close();
	}
	return res;
};

export default GetProxy;
