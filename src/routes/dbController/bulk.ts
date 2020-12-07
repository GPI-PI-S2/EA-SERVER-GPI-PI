import { celebrate, Joi } from 'celebrate';
import { DBController } from 'ea-core-gpi-pi';
import { Router } from 'express';
import { unlinkSync } from 'fs';
import multer, { diskStorage } from 'multer';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { DBCONTROLLER_TEMP_DIR, SITE_PUBLIC_DIR } from '../../config';
import { GPIFile } from '../../controllers/GPIFile';
import { GPIResponse } from '../../controllers/GPIResponse';
import { isDBControllerAuth } from '../../middlewares/isDBControllerAuth';
const storage = diskStorage({
	destination: DBCONTROLLER_TEMP_DIR,
});
const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1000 * 1000,
	},
});
const route = Router();
export default async (app: Router): Promise<void> => {
	app.use(route);
	route.post(
		'/bulk',
		isDBControllerAuth,
		celebrate({
			query: Joi.object({
				by: Joi.string().email().required(),
			}),
		}),
		upload.single('db'),
		async (req, res) => {
			const response = new GPIResponse(res);
			const logger = container.resolve<Logger>('logger');
			const DBController = container.resolve<DBController>('DBController');

			try {
				const by = req.query.by as string;
				const filepath = req.file.path;
				const mime = req.file.mimetype;
				const contribFilePath = SITE_PUBLIC_DIR + 'contributions.json';
				const contribFile = new GPIFile(contribFilePath);
				const contribContent: Record<string, number> = {};
				if (!mime.includes('application/octet-stream')) {
					unlinkSync(filepath);
					logger.debug(`File removed [${filepath}], with mime: ${mime}`);
					return response.error('BAD_REQUEST', 'Invalid mimetype', mime);
				}
				await DBController.connect();
				const result = await DBController.bulkDB(filepath);
				unlinkSync(filepath);
				logger.debug(`DB removed [${filepath}], with mime: ${mime}`);
				if (contribFile.exist()) {
					const content = await contribFile.read('object');
					Object.assign(contribContent, content);
				}
				if (!contribContent[by]) contribContent[by] = result.accepted;
				else contribContent[by] += result.accepted;
				await contribFile.write(contribContent);
				return response.ok(result);
			} catch (error) {
				if (error.isCustom) return response.errorFromCustom(error);
				return response.error(
					'INTERNAL_ERROR',
					'Problemas al procesar la base de datos',
					error,
				);
			}
		},
	);
};
