import { Response } from 'express';
export class GPIResponse {
	static errors: GPIResponse.Errors = {
		NOT_FOUND: 404,
		EXTRACTOR_TIMEOUT: 403,
		EXTRACTOR_ERROR: 500,
	};
	constructor(private readonly res: Response) {}
	ok(data: unknown): GPIResponse.JSONReturn {
		return this.res.status(200).json({ data });
	}
	error(type: GPIResponse.error, message: string, ...data: unknown[]): GPIResponse.JSONReturn {
		const code = GPIResponse.errors[type];
		const estructure: GPIResponse.ErrorStructure = {
			type,
			message,
			data,
		};
		return this.res.status(code).json(estructure);
	}
}
export namespace GPIResponse {
	export type JSONReturn = ReturnType<Response['json']>;
	export type error = 'NOT_FOUND' | 'EXTRACTOR_ERROR' | 'EXTRACTOR_TIMEOUT';
	export type Errors = Record<error, number>;
	export interface ErrorStructure {
		type: error;
		message: string;
		data: unknown;
	}
}
