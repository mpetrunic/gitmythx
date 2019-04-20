import Octokit from "@octokit/rest";
import githubAppInstallationService from "./GithubAppInstallationService";
import {CheckRunConclusion, CheckRunStatus, GithubEvent} from "./types";

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
        return this.setCheckPendingStatus(event);
    }

    public async initiateCheckRun(payload: GithubEvent): Promise<boolean> {
        await this.setCheckStartedStatus(payload);

        // TODO: run analisys

        await this.setCheckCompletedStatus(payload, CheckRunConclusion.SUCCESS);
        return true;
    }

    private setCheckPendingStatus(event: GithubEvent) {
        return this.client.checks.create({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            name: "GitMythx",
            head_sha: event.check_suite ? event.check_suite.head_sha : event.check_run.head_sha,
        });
    }

    private setCheckStartedStatus(event: GithubEvent) {
        return this.client.checks.update({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            name: "GitMythx",
            check_run_id: event.check_run.id,
            started_at: new Date().toISOString(),
            status: CheckRunStatus.IN_PROGRESS,
        });
    }

    private setCheckCompletedStatus(event: GithubEvent, conclusion: CheckRunConclusion) {
        return this.client.checks.update({
            owner: event.repository.owner.login,
            repo: event.repository.name,
            name: "GitMythx",
            check_run_id: event.check_run.id,
            status: CheckRunStatus.COMPLETED,
            conclusion,
            completed_at: new Date().toISOString(),
            details_url: "https://gitmithx.com",
        });
    }
}
