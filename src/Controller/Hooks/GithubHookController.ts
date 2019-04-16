import {Request, Response} from "express";
import GithubAppService from "../../Services/Github/GithubAppService";
import {EventAction, GithubEvent} from "../../Services/Github/types";
import logger from "../../Services/Logger";

export default class GithubHookController {

    public static async hook(req: Request, res: Response): Promise<void> {
        const event = req.headers["x-github-event"];
        logger.info(`Received github hook event "${event}"`);
        res.status(200).end();
        switch (event) {
            case "check_suite": {
                const payload = req.body as GithubEvent;
                if (payload.action === EventAction.REQUESTED || payload.action === EventAction.REREQUESTED) {
                    await new GithubAppService(payload.repository.owner.login, payload.repository.name)
                        .createCheckRun(payload);
                }
            }
                                break;
            default: {
                logger.info(`Ignoring github event "${event}"`);
            }
        }
        return;
    }

}
