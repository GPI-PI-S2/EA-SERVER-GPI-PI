export class CustomError extends Error {
	constructor(
		readonly type: CustomError.type,
		message: string,
		private readonly _error?: unknown,
	) {
		super(message);
		this._error = _error;
	}
	readonly isCustom = true;
	get error(): unknown {
		return this._error;
	}
}
export namespace CustomError {
	export type type = 'NOT_FOUND' | 'INTERNAL_ERROR';
}
