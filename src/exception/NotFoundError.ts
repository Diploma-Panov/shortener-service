export class NotFoundError extends Error {
    constructor(entity: string, field: string, value: string | number) {
        super(`Could not find ${entity} with ${field}=${value}`);
    }
}
