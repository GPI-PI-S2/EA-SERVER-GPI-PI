import { Response } from 'express';
import { CustomError } from '../CustomError';

export class GPIResponse {
	static errors: GPIResponse.Errors = {
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		EXTRACTOR_TIMEOUT: 403,
		FORBIDEN: 403,
		NOT_FOUND: 404,
		EXTRACTOR_ERROR: 500,
		INTERNAL_ERROR: 500,
	};
	constructor(private readonly res: Response) {}
	ok(data: unknown): GPIResponse.JSONReturn {
		return this.res.status(200).json({ data });
	}
	errorFromCustom(customError: CustomError): GPIResponse.JSONReturn {
		const message = customError.message ? customError.message : 'Error desconocido';
		return this.error(customError.type, message);
	}
	error(type: GPIResponse.error, message: string, ...data: unknown[]): GPIResponse.JSONReturn {
		console.log(data);
		const code = GPIResponse.errors[type];
		const estructure: GPIResponse.ErrorStructure = {
			type,
			message: message ? message : 'Error desconocido',
			data: data.length > 0 ? data : undefined,
		};
		return this.res.status(code).json(estructure);
	}
}
export namespace GPIResponse {
	export type JSONReturn = ReturnType<Response['json']>;
	export type error =
		| 'FORBIDEN'
		| 'BAD_REQUEST'
		| 'UNAUTHORIZED'
		| 'INTERNAL_ERROR'
		| 'NOT_FOUND'
		| 'EXTRACTOR_ERROR'
		| 'EXTRACTOR_TIMEOUT';
	export type Errors = Record<error, number>;
	export interface ErrorStructure {
		type: error;
		message: string;
		data: unknown;
	}
}
