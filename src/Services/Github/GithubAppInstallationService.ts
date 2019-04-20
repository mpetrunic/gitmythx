import Octokit from "@octokit/rest";
import githubApp from "./GithubApp";
export class GithubAppInstallationService {

    public async getInstallationToken(owner: string, repo: string): Promise<string> {
        const id = await this.getInstallationId(owner, repo);
        return await githubApp.getInstallationToken(id);
    }

    private async getInstallationId(owner: string, repo: string): Promise<number> {
        const client = new Octokit({auth: githubApp.getJwt()});
        const {data} = await client.apps.findRepoInstallation({
                owner,
                repo,
            });
        return data.id;
    }

}

export default new GithubAppInstallationService();
