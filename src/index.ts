import * as winston from "winston";
import app from "./App";

const port = process.env.SERVER_PORT || 3000;

app.listen(port, (err) => {
    if (err) {
        return winston.error(err);
    }

    return winston.info(`Server is listening on ${port}`);
});
