'use strict';

/**
 * Classe d'erreur applicative
 * Usage:
 *   throw new AppError('Ressource non trouvée', 404);
 */
export class AppError extends Error {
    /**
     * @param {string} message
     * @param {number} [statusCode=500]
     */
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // marque les erreurs prévues vs bugs
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            statusCode: this.statusCode,
        };
    }

    /**
     * Wrappe une erreur inconnue en AppError (préserve le stack si présent)
     * @param {Error|AppError|string} err
     * @param {number} [defaultStatus=500]
     * @returns {AppError}
     */
    static from(err, defaultStatus = 500) {
        if (err instanceof AppError) return err;
        const message = (err && err.message) || String(err) || 'Erreur interne';
        const statusCode = (err && err.statusCode) || defaultStatus;
        const appErr = new AppError(message, statusCode);
        if (err && err.stack) appErr.stack = err.stack;
        return appErr;
    }
}
