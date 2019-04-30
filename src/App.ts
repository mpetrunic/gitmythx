import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express = require("express");
import {Express, Request, Response, Router} from "express";
import helmet from "helmet";
import morgan from "morgan";
import * as path from "path";
import api from "./Routes/Api";
import github from "./Routes/GithubWebhook";
import views from "./Routes/Views";
import {githubUserMiddleware} from "./Services/GithubUserMiddleware";
import severity from "./Services/Helpers/SeverityClasses";
import {morganLogger} from "./Services/Logger";

class App {

    public server: Express;

    constructor() {
        this.server = express();
        // add before route middleware's here
        this.server.use(morgan("short", { stream: morganLogger }));
        this.server.use(helmet());
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(cookieParser());
        this.server.use(githubUserMiddleware);
        this.server.set("view engine", "pug");
        this.server.set("views", path.join(__dirname, "/Public/Views"));
        this.server.use(express.static(__dirname + "/Public"));
        this.server.locals.severity = severity;
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
        this.server.use("/", views);
        this.server.use("/", router);
    }
}

export default new App().server;
