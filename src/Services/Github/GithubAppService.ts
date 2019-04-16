import Octokit from "@octokit/rest";
import githubAppInstallationService from "./GithubAppInstallationService";
import {GithubEvent} from "./types";

export default class GithubAppService {

    private client: Octokit;

    public constructor(owner: string, repo: string) {
        this.client = new Octokit({
            auth:  () => {
                return githubAppInstallationService.getInstallationToken(owner, repo);
            },
        });
    }

    public async createCheckRun(event: GithubEvent): Promise<Octokit.Response<Octokit.ChecksCreateResponse>> {
        return this.client.checks.create({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            name: "GitMythx",
            head_sha: event.check_suite ? event.check_suite.head_sha : event.check_run.head_sha,
        });
    }

}
