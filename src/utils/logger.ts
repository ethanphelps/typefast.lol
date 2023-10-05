const LOGGING_ENABLED = true;
const DEBUG_LOGGING_ENABLED = true;

export const log = (message: any, ...args: any[]): void => {
    if(LOGGING_ENABLED) {
        console.log(message, ...args);
    }
}

export const debug = (message: any, ...args: any[]): void => {
    if(DEBUG_LOGGING_ENABLED) {
        console.debug(message, ...args);
    }
}

export const error = (message: any, ...args: any[]): void => {
    if(DEBUG_LOGGING_ENABLED) {
        console.error(message, ...args);
    }
}