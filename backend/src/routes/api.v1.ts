import { Router } from "express";
import { artisanController } from "../controllers/artisanController.js";
import { aviationController } from "../controllers/aviationController.js";
import { maritimeController } from "../controllers/maritimeController.js";
import { railwayController } from "../controllers/railwayController.js";
import authRouter from "./auth.route.js"; 
import { authMiddleware } from "../middleware/auth.middleware.js";
export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.post("/artisan/birth-certificate",authMiddleware, artisanController.createDraft);
apiV1Router.post("/aviation/declaration", aviationController.submit);
apiV1Router.post("/maritime/declaration", maritimeController.submit);
apiV1Router.post("/railway/declaration", railwayController.submit);