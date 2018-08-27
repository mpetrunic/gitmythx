import * as express from "express";
import * as morgan from "morgan";
import {morganLogger} from "./services/Logger";

class App {

    public server;

    constructor() {
        this.server = express();
        this.server.use(morgan("short", { stream: morganLogger }));
        this.addRoutes();
    }

    private addRoutes(): void {
        const router = express.Router();
        router.get("/", (req, res) => {
            return res.json({
                message: "Welcome stranger!",
            });
        });
        this.server.use("/", router);
    }
}

export default new App().server;
