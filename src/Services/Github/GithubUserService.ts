import Octokit from "@octokit/rest";
import config from "../../Config/Config";
import logger from "../Logger";

export class GithubUserService {

    public async getUserAccessCode(code: string): Promise<string> {
        const client = new Octokit();
        try {
            const response = await client.request("POST /login/oauth/access_token", {
                headers: {
                    accept: "application/json",
                },
                data: {
                    client_id: config.github.client.id,
                    client_secret: config.github.client.secret,
                    code,
                },
                baseUrl: "https://github.com",
            });
            return response.data.access_token;
        } catch (e) {
            logger.error(JSON.stringify(e));
        }

    }

    public async hasValidAccessToken(token: string): Promise<boolean> {
        if (!token) { return false; }
        return true;
    }
}
