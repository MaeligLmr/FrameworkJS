/**
 * Classe d'erreur applicative
 * Usage:
 *   throw new AppError('Ressource non trouvée', 404);
 *   throw new AppError('Validation échouée', 400, ['Champ requis', 'Format invalide']);
 */
export class AppError extends Error {
    /**
     * @param {string} message
     * @param {number} [statusCode=500]
     * @param {string[]} [errors=[]]
     */
    constructor(message, statusCode = 500, errors = []) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // marque les erreurs prévues vs bugs
        this.errors = Array.isArray(errors) ? errors : [message];
        if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            message: this.message,
            errors: this.errors,
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
        const errors = (err && err.errors) || [message];
        const appErr = new AppError(message, statusCode, errors);
        if (err && err.stack) appErr.stack = err.stack;
        return appErr;
    }
}
