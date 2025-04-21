import { NextFunction, Request, Response, RequestHandler } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestError } from '../exception/BadRequestError';

function formatValidationErrors(
    errors: ValidationError[],
    parentPath = '',
): Record<string, string[]> {
    return errors.reduce((acc, err) => {
        const propertyPath = parentPath ? `${parentPath}.${err.property}` : err.property;

        if (err.constraints) {
            acc[propertyPath] = Object.values(err.constraints);
        }

        if (err.children && err.children.length > 0) {
            const childErrors = formatValidationErrors(err.children, propertyPath);
            Object.assign(acc, childErrors);
        }

        return acc;
    }, {} as Record<string, string[]>);
}

export const validationMiddleware = <T extends Object>(dtoClass: new () => T): RequestHandler => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const dtoObject = plainToInstance(dtoClass, req.body);

        const errors = await validate(dtoObject, {
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: { target: false },
        });

        if (errors.length > 0) {
            const formattedErrors = formatValidationErrors(errors);
            next(new BadRequestError(JSON.stringify(formattedErrors)));
            return;
        }

        req.body = dtoObject as unknown as any;
        next();
    };
};
