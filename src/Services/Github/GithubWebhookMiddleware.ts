import githubWebhookMiddlware from "github-webhook-middleware";
import config from "../../Config/Config";

const githubMiddleware = githubWebhookMiddlware({
    secret: config.github.webhook.secret,
    limit: "1mb",
});

export default githubMiddleware;
