import Router from 'koa-router';
import body from 'koa-json';

import { Category, Project } from '../models';

const router = new Router({ prefix: '/project' });

router.use(body());

router.get('/', async ctx => {
	let where = {};
	let count = 20;
	if (ctx.request.query.count) {
		count = parseInt(ctx.request.query.count);
	}
	let page = 1;
	if (ctx.request.query.page) {
		page = parseInt(ctx.request.query.page);
	}
	page--;
	if (page < 0) {
		page = 0;
	}

	if (
		ctx.request.query.categoryes &&
		ctx.request.query.categoryes != null &&
		ctx.request.query.categoryes != 'null' &&
		ctx.request.query.categoryes.length > 0
	) {
		const categoryes = ctx.request.query.categoryes.split(',');
		where = {
			...where,
			...{
				categoryId: categoryes,
			},
		};
	}

	const res = await Project.findAndCountAll({
		where,
		include: [
			{
				model: Category,
				as: 'category',
				include: [{ model: Category, as: 'parent' }],
			},
		],
		order: [['flId', 'desc']],
		offset: page * count,
		limit: count,
	});
	ctx.body = { status: true, data: res };
});

export default router;
