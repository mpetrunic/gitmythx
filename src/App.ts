import * as express from "express";

class App {

    public server;

    constructor() {
        this.server = express();
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
