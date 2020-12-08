import { config, createLogger, format, transports } from 'winston';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { IS_DEV, LOGS_LEVEL } from '../../config';
import prismjs from './prismjs';

const { combine, json, splat, cli, printf } = format;
const myFormat = printf(({ level, message, ...metadata }) => {
	const msg = `${level}: ${message} `;
	const splat = (Reflect.ownKeys(metadata).find(
		(key) => String(key) === 'Symbol(splat)',
	) as unknown) as string;
	if (splat) {
		const delimiter = '--------⬆️';
		Object.values({ ...metadata[splat] }).forEach((value) => {
			const r = prismjs(JSON.stringify(value, null, 2));
			console.log(r);
		});
		return delimiter;
	} else return msg;
});
const cTransports: ConsoleTransportInstance[] = [];
if (IS_DEV) {
	cTransports.push(
		new transports.Console({
			format: combine(),
		}),
	);
} else {
	cTransports.push(new transports.Console());
}

const LoggerInstance = IS_DEV
	? createLogger({
			level: process.env.LEVEL,
			levels: config.npm.levels,
			format: combine(format.colorize(), splat(), json(), cli(), myFormat),
			transports: cTransports,
	  })
	: createLogger({
			level: LOGS_LEVEL,
			levels: config.npm.levels,
			format: format.combine(
				format.timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				format.errors({ stack: true }),
				format.splat(),
				format.json(),
			),
			transports: cTransports,
	  });

export default LoggerInstance;
