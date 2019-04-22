import Octokit from "@octokit/rest";
import config from "../../Config/Config";
import logger from "../Logger";

// tslint:disable-next-line:interface-name
export interface GithubUser {
    login: string;
    id: number;
    avatar_url: string;
}

export class GithubUserService {

    private client: Octokit;

    constructor(token?: string) {
        if (token) {
            this.client = new Octokit({
                auth: token,
            });
        }
    }

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

    public async getUserDetails(): Promise<GithubUser> {
        if (!this.client) { return null; }
        return (await this.client.users.getAuthenticated()).data;
    }
}
