import Router from 'koa-router';
import body from 'koa-json';

import { Category, Project } from '../models';

const router = new Router({ prefix: '/category' });

router.use(body());

// get all
router.get('/', async ctx => {
	const categoryes = await Category.findAll({
		where: { parentId: null },
		include: [{ model: Category, as: 'child', include: [{ model: Category, as: 'child' }] }],
	});
	ctx.body = { status: true, data: categoryes };
});

// delete
router.delete('/:id', async ctx => {
	const category = await Category.findOne({
		where: { id: parseInt(ctx.params.id) },
		include: [{ model: Category, as: 'child' }],
	});
	if (category) {
		for (const index in category.child) {
			const ch = category.child[index];
			await Project.destroy({ where: { parentId: ch.id } });
			await ch.destroy();
		}
		await category.destroy();
	}
	ctx.body = { status: true };
});

// edit
router.post('/:id', async ctx => {
	const category = (await Category.findOne({ where: { id: parseInt(ctx.params.id) } })) as Category;
	await category.update(ctx.request.body);
	ctx.body = { status: true, data: category };
});

// create
router.put('/', async ctx => {
	const category = await Category.create(ctx.request.body);
	await category.save();
	ctx.body = { status: true, data: category };
});

export default router;