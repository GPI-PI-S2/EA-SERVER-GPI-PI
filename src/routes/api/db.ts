import { celebrate, Joi } from 'celebrate';
import { DBController, DBEntry } from 'ea-core-gpi-pi';
import { Router } from 'express';
import { container } from 'tsyringe';
import { GPIResponse } from '../../controllers/GPIResponse';
import { isApiAuth } from '../../middlewares/isApiAuth';

const route = Router();
export default async (app: Router): Promise<void> => {
	app.use('/db', route);
	route.post(
		'/entry/list',
		isApiAuth,
		celebrate({
			body: Joi.object({
				pager: Joi.object({
					page: Joi.number().min(0).max(100).required(),
					size: Joi.number().min(1).max(100).optional(),
				}).required(),
				filter: Joi.object({
					created: Joi.string().isoDate().optional(),
					extractor: Joi.string().max(500).optional(),
					metaKey: Joi.string().max(1000).optional(),
				}).optional(),
			}),
		}),
		async (req, res) => {
			const DBController = container.resolve<DBController>('DBController');
			const response = new GPIResponse(res);
			try {
				let {
					// eslint-disable-next-line prefer-const
					pager,
					filter,
				}: { pager: DBController.Paginator; filter?: DBEntry.Filter } = req.body;
				if (!filter) filter = {};
				await DBController.connect();
				const list = await DBController.$entry.list(pager, filter);
				await DBController.disconnect();
				return response.ok(list);
			} catch (error) {
				if (error.isCustom) return response.errorFromCustom(error);
				return response.error('INTERNAL_ERROR', 'Problemas al obtener los stats', error);
			}
		},
	);
	route.post(
		'/anal/fetch',
		isApiAuth,
		celebrate({
			body: Joi.object({
				id: Joi.string().min(1).max(300).required(),
			}),
		}),
		async (req, res) => {
			const response = new GPIResponse(res);
			const DBController = container.resolve<DBController>('DBController');
			try {
				const { id }: { id: string } = req.body;
				await DBController.connect();
				const anal = await DBController.$analysis.read(id, true);
				return response.ok(anal);
			} catch (error) {
				if (error.isCustom) return response.errorFromCustom(error);
				return response.error('INTERNAL_ERROR', 'Problemas al obtener los stats', error);
			}
		},
	);
};
