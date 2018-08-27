import logger from "./Services/Logger";
import app from "./App";
import config from "./Config/Config";

app.listen(config.port, (err) => {
    if (err) {
        return logger.error(err);
    }

    return logger.info(`Server is listening on ${config.port}`);
});
