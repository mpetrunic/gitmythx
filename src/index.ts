import * as winston from "winston";
import app from "./App";
import config from "./config/Config";

app.listen(config.port, (err) => {
    if (err) {
        return winston.error(err);
    }

    return winston.info(`Server is listening on ${config.port}`);
});
