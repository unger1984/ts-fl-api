require('./sequelize');

import puppeteer from 'puppeteer';
import moment from 'moment';

import { flStrip, fltoDate } from './utils';
import getProxy from './proxy';
import logger from './logger';
import Project from './models/Project';
import Category from './models/Category';
import { op } from './sequelize';

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
let skipCounter = 0;

const parse = async () => {
	const args = ['--no-sandbox'];
	try {
		if (proxyList.length <= 0) {
			proxyList = await getProxy();
		}
		if (proxyList.length > 0) {
			if (!usedProxy || skipCounter > 4) {
				usedProxy = proxyList.pop();
				skipCounter = 0;
				args.push(`--proxy-server=${usedProxy}`);
			} else if (usedProxy) {
				args.push(`--proxy-server=${usedProxy}`);
			}
		}
	} catch (err) {
		logger.info('not use proxy', err);
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
		const hideButton = await page.$('#hide_top_project_lnk');
		if (hideButton) {
			await hideButton.click();
		}

		hidden = 0;

		pPosts = await page.$$('.b-post:not(.topprjpay)');
	} catch (err) {
		logger.error(err);
		usedProxy = null;
		skipCounter++;
		if (browser) {
			await browser.close();
		}
		setTimeout(parse, 1000);
		return;
	}

	let projectCounter = 0;
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

				const sproject = await Project.create(project);
				await sproject.save();
				logger.info('project', index, id);
				projectCounter++;
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
	if (projectCounter <= 0) {
		skipCounter++;
	}

	// удалим все старое
	Project.destroy({ where: { date: { [op.lte]: moment().subtract(2, 'days') } } });

	const __ms = Date.now() - __start;
	logger.info(`Time work - ${__ms}ms`);
	setTimeout(parse, 15 * 1000);
};

parse();
