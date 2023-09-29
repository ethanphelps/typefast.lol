const LOGGING_ENABLED = false;
const DEBUG_LOGGING_ENABLED = false;

export const log = (message: any, ...args: any[]): void => {
    if(LOGGING_ENABLED) {
        console.log(message, args);
    }
}

export const debug = (message: any, ...args: any[]): void => {
    if(DEBUG_LOGGING_ENABLED) {
        console.debug(message, args);
    }
}