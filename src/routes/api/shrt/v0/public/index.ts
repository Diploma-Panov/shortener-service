import {Router} from "express";
import {platformRouter} from "./platform/platform";

const publicRouter = Router();

publicRouter.use('/platform', platformRouter);

export { publicRouter };