import Octokit from "@octokit/rest";
import {GitRepo} from "../GitRepo";
import logger from "../Logger";
import {Analysis} from "../MythX/Analysis";
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
        logger.info(
            `Seting check run status to "started" for
            checkrun ${payload.check_run.id} (${payload.repository.full_name})`,
        );
        await this.setCheckStartedStatus(payload);
        try {
            logger.info("Fetching installation token...");
            const installationToken = await githubAppInstallationService.getInstallationToken(
                payload.repository.owner.login,
                payload.repository.name,
            );
            const repo = new GitRepo(
                payload.repository.owner.id,
                payload.repository.full_name,
                payload.repository.name,
                payload.check_run.head_branch,
                payload.check_run.head_sha,
                installationToken,
            );
            logger.info(`Cloning ${payload.repository.full_name}#${payload.check_run.head_sha}`);
            await repo.clone();
            const analysis = new Analysis(repo);
            await analysis.run();
            await this.setCheckCompletedStatus(payload, CheckRunConclusion.SUCCESS);
        } catch (e) {
            logger.error(e.message);
            await this.setCheckCompletedStatus(payload, CheckRunConclusion.FAILURE);
        }
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
