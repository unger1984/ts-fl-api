import puppeteer from 'puppeteer';
import moment from 'moment';

import { Category, Project, op } from './models';
import { flStrip, fltoDate } from './utils';
import getProxy from './proxy';
import logger from './logger';

interface ProjectType {
	flId: number;
	link: string;
	title: string;
	categoryId: number | null;
	text: string | null;
	price: string | null;
	date: Date | null;
}

const saveCategoryes = async (categoryes: string[]): Promise<Category | null> => {
	if (categoryes.length > 0) {
		let parent = await Category.findOne({ where: { title: categoryes[0] } });
		if (!parent) {
			parent = await Category.create({ title: categoryes[0] });
			await parent.save();
		}
		if (categoryes.length > 1) {
			let child = await Category.findOne({ where: { parentId: parent.id, title: categoryes[1] } });
			if (!child) {
				child = await Category.create({ title: categoryes[1], parentId: parent.id });
				await child.save();
			}
			return child;
		}
		return parent;
	}
	return null;
};

let usedProxy: string | null | undefined = null;
let proxyList: string[] = [];

const parse = async () => {
	const args = ['--no-sandbox'];
	if (usedProxy) {
		args.push(`--proxy-server=${usedProxy}`);
	} else {
		try {
			if (proxyList.length <= 0) {
				proxyList = await getProxy();
			}
			if (proxyList.length > 0) {
				usedProxy = proxyList.pop();
				args.push(`--proxy-server=${usedProxy}`);
			}
		} catch (err) {
			logger.info('not use proxy', err);
		}
	}

	logger.info('use', args);

	const __start = Date.now();
	let browser = null;
	let pPosts = [];
	let page = null;
	let hidden = 0;
	try {
		browser = await puppeteer.launch({ args: args });
		page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 920 });
		await page.setExtraHTTPHeaders({
			'Upgrade-Insecure-Requests': '1',
			Referer: 'https://www.fl.ru/projects/?kind=1',
		});
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
		);
		await page.goto('https://www.fl.ru/projects/?kind=1');
		// await page.screenshot({path: '/tmp/test.png'});
		// await page.waitFor(1000*10)
		const hideButton = await page.$('#hide_top_project_lnk');
		if (hideButton) {
			await hideButton.click();
		}
		// await (await page.$('.b-filter-toggle-link')).click()
		// await page.screenshot({path: 'screenshots/test.png'});

		// const hiddenDiv = await page.$(
		// 	'.b-menu__filter > .b-layout__txt.b-layout__txt_color_323232.b-layout__txt_valign_top.b-layout__txt_float_left.b-layout__txt_right',
		// );
		// if(hiddenDiv) {
		//     hidden = parseInt(await (await (hiddenDiv)
		//         .getProperty("innerText")).jsonValue())
		//     if (!hidden || isNaN(hidden))
		//         hidden = 0;
		// }else
		hidden = 0;

		pPosts = await page.$$('.b-post:not(.topprjpay)');
	} catch (err) {
		logger.error(err);
		usedProxy = null;
		if (browser) {
			await browser.close();
		}
		setTimeout(parse, 1000);
		return;
	}
	// await page.screenshot({path: 'screenshots/test.png'});

	if (pPosts && pPosts.length > hidden) {
		for (let index = hidden; index < pPosts.length; index++) {
			try {
				const id = ((await (await pPosts[index].getProperty('id')).jsonValue()) as string).replace(
					'project-item',
					'',
				);

				const alink = await pPosts[index].$('h2 > a');
				const priceDiv = await pPosts[index].$('.b-post__price');

				const project: ProjectType = {
					flId: parseInt(id),
					link: alink ? ((await (await alink.getProperty('href')).jsonValue()) as string) : '',
					title: alink ? ((await (await alink.getProperty('innerText')).jsonValue()) as string) : '',
					price: priceDiv ? ((await (await priceDiv.getProperty('innerText')).jsonValue()) as string) : null,
					text: null,
					categoryId: null,
					date: null,
				};

				page = await browser.newPage();
				await page.setViewport({ width: 1280, height: 920 });
				await page.setExtraHTTPHeaders({
					'Upgrade-Insecure-Requests': '1',
					Referer: 'https://www.fl.ru/projects/?kind=1',
				});
				await page.setUserAgent(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
				);
				await page.goto(project.link);

				const divText = await page.$(`#projectp${id}`);
				if (divText) {
					const text = ((await (await divText.getProperty('innerHTML')).jsonValue()) as string).trim();
					project.text = flStrip(text);
				}

				const categoryes = [];
				let aCategoryes = await page.$$('.b-layout__txt.b-layout__txt_fontsize_11.b-layout__txt_padbot_20 > a');
				if (!aCategoryes || aCategoryes.length <= 0) {
					aCategoryes = await page.$$('.b-layout__txt.b-layout__txt_fontsize_11 > a');
				}
				for (const jkey in aCategoryes) {
					const catText = ((await (
						await aCategoryes[jkey].getProperty('innerText')
					).jsonValue()) as string).trim();
					if (catText) {
						categoryes.push(catText);
					}
				}
				const category = await saveCategoryes(categoryes);
				if (category) {
					project.categoryId = category.id;
				}

				project.date = fltoDate(
					(await (
						await (
							await page.$$(
								'.b-layout__txt.b-layout__txt_padbot_30 > .b-layout__txt.b-layout__txt_fontsize_11',
							)
						)[1].getProperty('innerText')
					).jsonValue()) as string,
				);

				// await page.screenshot({path: 'screenshots/'+id+'.png'});
				const sproject = await Project.create(project);
				await sproject.save();
				logger.info('project', index, id);
			} catch (err) {
				if (err.name && err.name === 'SequelizeUniqueConstraintError') {
					logger.error('BREAK');
					break;
				}
				logger.error(err.toString(), err);
			}
		}
	}
	if (browser) {
		await browser.close();
	}

	// удалим все старое
	Project.destroy({ where: { date: { [op.lte]: moment().subtract(2, 'days') } } });

	const __ms = Date.now() - __start;
	logger.info(`Time work - ${__ms}ms`);
	setTimeout(parse, 15 * 1000);
};

parse();
