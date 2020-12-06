import { celebrate, Joi } from 'celebrate';
import { CronJob } from 'cron';
import { arrayLeftOuterJoin } from 'ea-common-gpi-pi';
import { Extractor } from 'ea-core-gpi-pi/dist/services/Extractor';
import { Router } from 'express';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { DBSessionChecker } from '../../controllers/DBSessionChecker';
import { GPIResponse } from '../../controllers/GPIResponse';
import { isApiAuth } from '../../middlewares/isApiAuth';

const route = Router();
export default async (app: Router): Promise<void> => {
	const extractors = (await import('ea-core-gpi-pi')).default;
	type availables = Parameters<typeof extractors.get>['0'];
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type extractors<T extends availables> = ReturnType<typeof extractors.get>;
	const tempList: { [key: string]: { [key in availables]?: extractors<availables> } } = {};

	/**
	 * Verifica y mantiene las instancias de extractores cada *\/10,
	 * con el fin de evitar fugas de memoria
	 */
	const job = new CronJob('*/10 * * * *', async () => {
		const logger = container.resolve<Logger>('logger');
		try {
			logger.verbose('CRONO, checking sessions');
			//console.table(Object.keys(tempList));
			const validSessionKeys = await DBSessionChecker.check();
			const localSessionKeys = Object.keys(tempList);
			const obsoletKeys = arrayLeftOuterJoin(localSessionKeys, validSessionKeys);
			//console.log('removed', obsoletKeys);
			logger.verbose(`CRONO, sessions to remove: ${obsoletKeys.length}`);
			obsoletKeys.forEach((key) => delete tempList[key]);
		} catch (error) {
			logger.error(error);
		}
		return;
	});

	// Inicializa el job
	job.start();

	/**
	 * Busca y obtiene un extractor válido para ser guardado en memoria
	 * @template T
	 * @param {string} sessionId id de la sesión
	 * @param {T} extractorId id del extractor
	 * @param {boolean} strict Si no lo encuentra devuelve error en vez de guardarlo en memoria
	 * @returns {extractors<T>} extractor
	 */
	function extractorGet<T extends availables>(
		sessionId: string,
		extractorId: T,
		strict: boolean,
	): extractors<T> {
		if (!tempList[sessionId]) {
			if (strict) throw new Error('invalid id');
			else tempList[sessionId] = {};
		}
		if (!tempList[sessionId][extractorId]) {
			if (strict) throw new Error('not found');
			else {
				const e = extractors.get(extractorId);
				if (e) tempList[sessionId][extractorId] = e;
				return e;
			}
		} else {
			return tempList[sessionId][extractorId];
		}
	}
	app.use('/extractors', route);
	route.get('/list', isApiAuth, async (req, res) => {
		const list = extractors.availables;
		return res.json({ data: list }).status(200);
	});
	route.post(
		'/deploy',
		isApiAuth,
		celebrate({
			body: Joi.object({
				id: Joi.string().required().min(1).max(50),
				config: Joi.any(),
				options: Joi.any(),
			}),
		}),
		async (req, res) => {
			const sessionId = req.session.id;
			let {
				// eslint-disable-next-line prefer-const
				id,
				config,
				options,
			}: {
				id: availables;
				config: Extractor.Deploy.Config;
				options: Extractor.Deploy.Options;
			} = req.body;
			if (!config) config = {};
			if (!options) options = {};
			const extractor = extractorGet(sessionId, id, false);
			const gpiRes = new GPIResponse(res);
			//console.log('deploy', extractor);
			if (!extractor)
				return gpiRes.error('NOT_FOUND', 'No se encontró el extractor', extractor);
			try {
				const deployResponse = await extractor.deploy(config as never, options as never);
				if (deployResponse.isError)
					return gpiRes.error('EXTRACTOR_ERROR', 'Problemas al ejecutar deploy', {
						status: deployResponse.status,
						data: deployResponse.data,
					});
				else return gpiRes.ok({ status: deployResponse.status, data: deployResponse.data });
			} catch (error) {
				return gpiRes.error('NOT_FOUND', 'problemas al iniciar el extractor', error);
			}
		},
	);
	route.post(
		'/obtain',
		isApiAuth,
		celebrate({
			body: Joi.object({
				id: Joi.string().required().min(1).max(50),
				options: Joi.any().required(),
			}),
		}),
		async (req, res) => {
			const sessionId = req.session.id;
			const {
				id,
				options,
			}: {
				id: availables;
				options: Extractor.Obtain.Options;
			} = req.body;
			const gpiRes = new GPIResponse(res);
			try {
				const extractor = extractorGet(sessionId, id, true);
				//console.log('obtain', extractor);
				const obtainResponse = await extractor.obtain(options as never);
				if (obtainResponse.isError)
					return gpiRes.error('EXTRACTOR_ERROR', 'Problemas al ejecutar obtain', {
						status: obtainResponse.status,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						data: (obtainResponse.data as any).message
							? // eslint-disable-next-line @typescript-eslint/no-explicit-any
							  (obtainResponse.data as any).message
							: obtainResponse.data,
					});
				else return gpiRes.ok({ status: obtainResponse.status, data: obtainResponse.data });
			} catch (error) {
				return gpiRes.error(
					'EXTRACTOR_TIMEOUT',
					'Instancia no inicializada',
					error.message ? error.message : error,
				);
			}
		},
	);
};
