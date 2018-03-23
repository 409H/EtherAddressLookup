class ConsoleLogger {
    /**
     * Determine if eal_debug cookie is set
     */
    get debug() {
        return !!document.cookie.match(/^(.*;)?\s*eal_debug\s*=\s*[^;]+(.*)?$/);
    }

    /**
     * Log a message to the console 
     * 
     * @param {*} args 
     */
    log(...args) {
        if (this.debug) {
            console.log.apply(this, args);
        }
    }

    /**
     * Log a warning message to the console
     * 
     * @param {*} args 
     */
    warn(...args) {
        if (this.debug) {
            console.warn.apply(this, args);
        }
    }

    /**
     * Log an error message to the console
     * 
     * @param {*} args 
     */
    error(...args) {
        if (this.debug) {
            console.error.apply(this, args);
        }
    }
}

const consoleLogger = new ConsoleLogger();