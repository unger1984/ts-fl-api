import Router from 'koa-router';
import body from 'koa-json';

import { User } from '../models';

const router = new Router({ prefix: '/user' });

router.use(body());

// create or update
router.put('/', async ctx => {
	const puser = ctx.request.body;
	let user = await User.findOne({ where: { uid: puser.uid } });

	puser.lastseen = new Date();

	if (!user) {
		user = await User.create(puser);
		await user.save();
	} else {
		await user.update(puser);
	}
	ctx.body = { success: true, data: user };
});

export default router;
