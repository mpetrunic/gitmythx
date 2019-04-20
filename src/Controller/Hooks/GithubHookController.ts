import {Request, Response} from "express";
import config from "../../Config/Config";
import GithubAppService from "../../Services/Github/GithubAppService";
import {EventAction, GithubEvent} from "../../Services/Github/types";
import logger from "../../Services/Logger";

export default class GithubHookController {

    public static async hook(req: Request, res: Response): Promise<void> {
        const event = req.headers["x-github-event"];
        logger.info(`Received github hook event "${event}"`);
        res.status(200).end();
        const payload = req.body as GithubEvent;
        switch (event) {
            case "check_suite": {
                if (payload.action === EventAction.REQUESTED || payload.action === EventAction.REREQUESTED) {
                    await new GithubAppService(
                        payload.repository.owner.login,
                        payload.repository.name,
                    ).createCheckRun(payload);
                }
            }                   break;
            case "check_run": {
                if (payload.check_run.app.id.toString(10) !== config.github.app.id) { return; }
                switch (payload.action) {
                    case EventAction.CREATED: {
                        await new GithubAppService(
                            payload.repository.owner.login,
                            payload.repository.name,
                        ).initiateCheckRun(payload);
                    }                         break;
                    case EventAction.REREQUESTED: {
                        await new GithubAppService(
                            payload.repository.owner.login,
                            payload.repository.name,
                        ).createCheckRun(payload);
                    }                             break;

                }
            }                 break;
            default: {
                logger.info(`Ignoring github event "${event}"`);
            }
        }
        return;
    }

}
