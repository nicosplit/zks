export const logger = {
    log: (...args: any[]) => {
        if (import.meta.env.DEV) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (import.meta.env.DEV) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        console.error(...args); // Always show errors
    }
};
