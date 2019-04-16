import {Express, Request, Response, Router} from "express";
import helmet from "helmet";
import morgan from "morgan";
import api from "./Routes/Api";
import github from "./Routes/GithubWebhook";
import {morganLogger} from "./Services/Logger";
import express = require("express");

class App {

    public server: Express;

    constructor() {
        this.server = express();
        // add before route middleware's here
        this.server.use(morgan("short", { stream: morganLogger }));
        this.server.use(helmet());
        this.addRoutes();
        // add after route middleware's here
    }

    private addRoutes(): void {
        const router = Router();
        router.get("/", (req: Request, res: Response) => {
            res.json({
                message: "Welcome stranger!",
            });
        });
        router.get("/health", (req: Request, res: Response) => {
            return res.json({
                status: "OK",
            });
        });
        this.server.use("/api", api);
        this.server.use("/github", github);
        this.server.use("/", router);
    }
}

export default new App().server;
