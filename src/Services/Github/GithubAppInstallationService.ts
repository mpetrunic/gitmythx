import Octokit from "@octokit/rest";
import githubApp from "./GithubApp";
export class GithubAppInstallationService {

    private client: Octokit;

    constructor() {
        this.client = new Octokit({auth: githubApp.getJwt()});
    }

    public async getInstallationToken(owner: string, repo: string): Promise<string> {
        const id = await this.getInstallationId(owner, repo);
        return await githubApp.getInstallationToken(id);
    }

    private async getInstallationId(owner: string, repo: string): Promise<number> {
        const {data} = await this.client.apps.findRepoInstallation({
                owner,
                repo,
            });
        return data.id;
    }

}

export default new GithubAppInstallationService();
