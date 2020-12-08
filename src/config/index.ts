import dotenv from 'dotenv';
const env = dotenv.config();
if (env.error) {
	// This error should crash whole process
	throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
export const ADDRESS = process.env.ADDRESS ? process.env.ADDRESS : 'localhost';
export const PROTOCOL = process.env.PROTOCOL ? process.env.PROTOCOL : 'http';

export const DEBUG = process.env.DEBUG ? (process.env.DEBUG === 'true' ? true : false) : false;
export const LOGS_LEVEL = process.env.LOG_LEVEL || 'silly';
export const IS_DEV = process.env.NODE_ENV
	? process.env.NODE_ENV === 'development'
		? true
		: false
	: false;

export const API_ENDPOINT = process.env.API_ENDPOINT ? process.env.API_ENDPOINT : '/api';
export const API_VERSION = process.env.API_VERSION ? process.env.API_VERSION : '/v1';
export const API_APP = process.env.API_APP;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;

export const DBCONTROLLER_ENDPOINT = process.env.DBCONTROLLER_ENDPOINT
	? process.env.DBCONTROLLER_ENDPOINT
	: '/dbcontroller';
export const DBCONTROLLER_VERSION = process.env.DBCONTROLLER_VERSION
	? process.env.DBCONTROLLER_VERSION
	: '/v1';
export const DBCONTROLLER_APP = process.env.DBCONTROLLER_APP;
export const DBCONTROLLER_KEY = process.env.DBCONTROLLER_KEY;

export const DBCONTROLLER_TEMP_DIR = process.env.DBCONTROLLER_TEMP_DIR
	? process.env.DBCONTROLLER_TEMP_DIR
	: 'src/public/';
// DB
export const DB_ADDRESS = process.env.DB_ADDRESS ? process.env.DB_ADDRESS : '127.0.0.1';
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
export const DB_LIMIT = process.env.DB_LIMIT ? parseInt(process.env.DB_LIMIT) : 20;
export const DB_USER = process.env.DB_USER ? process.env.DB_USER : '';
export const DB_PASS = process.env.DB_PASS ? process.env.DB_PASS : '';
export const DB_NAME = process.env.DB_NAME ? process.env.DB_NAME : '';

export const SITE_ENDPOINT = process.env.SITE_ENDPOINT ? process.env.SITE_ENDPOINT : '/';

// SITE
export const SITE_PUBLIC_DIR = process.env.SITE_PUBLIC_DIR
	? process.env.SITE_PUBLIC_DIR
	: 'src/public/';
