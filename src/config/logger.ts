import log4js from 'log4js';
import { config } from './index';

log4js.configure({
    appenders: {
        console: { type: 'console' },
        appFile: { type: 'file', filename: 'logs/app.log' },
    },
    categories: {
        default: { appenders: ['console', 'appFile'], level: config.app.logLevel },
    },
});

export const logger = log4js.getLogger();
