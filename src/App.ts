import * as express from "express";
import * as morgan from "morgan";
import api from "./Routes/Api";
import {morganLogger} from "./Services/Logger";

class App {

    public server;

    constructor() {
        this.server = express();
        // add before route middleware's here
        this.server.use(morgan("short", { stream: morganLogger }));
        this.addRoutes();
        // add after route middleware's here
    }

    private addRoutes(): void {
        const router = express.Router();
        router.get("/", (req, res) => {
            return res.json({
                message: "Welcome stranger!",
            });
        });
        router.get("/health", (req, res) => {
            return res.json({
                status: "OK",
            });
        });
        this.server.use("/api", api);
        this.server.use("/", router);
    }
}

export default new App().server;
