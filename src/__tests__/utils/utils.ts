import express, {Router} from "express";

export const createTestApplication = (baseRouter: Router) => {
    const app = express();
    app.use('/', baseRouter);
    return app;
}