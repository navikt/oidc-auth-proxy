import winston from 'winston';
const { format } = winston;
const { combine, json, timestamp } = format;

const stdoutLogger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: combine(timestamp(), json()),
        }),
    ],
});

const debug = (msg) => {
    stdoutLogger.debug(msg);
};

const info = (msg) => {
    stdoutLogger.info(msg);
};

const warning = (msg) => {
    stdoutLogger.warn(msg);
};

const error = (msg, err) => {
    if (err) {
        stdoutLogger.error(msg, { message: `: ${err.message}` });
    } else {
        stdoutLogger.error(msg, { message: `: ${err}` });
    }
};

module.exports = {
    debug,
    info,
    warning,
    error,
};
