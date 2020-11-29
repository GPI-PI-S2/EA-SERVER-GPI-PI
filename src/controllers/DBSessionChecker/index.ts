import mysql from 'promise-mysql';
import { DB_ADDRESS, DB_NAME, DB_PASS, DB_PORT, DB_USER } from '../../config';
export class DBSessionChecker {
	static async check(): Promise<string[]> {
		try {
			const db = await mysql.createConnection({
				host: DB_ADDRESS,
				port: DB_PORT,
				user: DB_USER,
				password: DB_PASS,
				database: DB_NAME,
			});
			const date = Math.round(Date.now() / 1000);
			const response: { session_id: string }[] = await db.query(
				`SELECT session_id FROM sessions WHERE expires<=${date};`,
			);
			await db.end();
			return response.map((session) => session.session_id);
		} catch (error) {
			return [];
		}
	}
}
