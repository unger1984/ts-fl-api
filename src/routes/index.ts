import Router from 'koa-router';

import UserRouter from './UserRouter';
import CategoryRouter from './CategoryRouter';
import ProjectRouter from './ProjectRouter';

const router = new Router({ prefix: '/api' });

router
	.use(UserRouter.routes())
	.use(UserRouter.allowedMethods())
	.use(CategoryRouter.routes())
	.use(CategoryRouter.allowedMethods())
	.use(ProjectRouter.routes())
	.use(ProjectRouter.allowedMethods());

export default router;
