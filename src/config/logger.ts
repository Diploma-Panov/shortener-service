import log4js from 'log4js';
import { config } from './index';

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
    },
    categories: {
        default: { appenders: ['out'], level: config.app.logLevel },
    },
});

export const logger = log4js.getLogger();
