import winston from 'winston';
import { IS_DEV, LOGS_LEVEL } from '../config';

const transports = [];
if (!IS_DEV) {
	transports.push(new winston.transports.Console());
} else {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(winston.format.cli(), winston.format.splat()),
		}),
	);
}

const LoggerInstance = winston.createLogger({
	level: LOGS_LEVEL,
	levels: winston.config.npm.levels,
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
	),
	transports,
});

export default LoggerInstance;
