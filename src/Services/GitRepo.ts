import * as fs from "fs";
import {Clone, Repository, Reset} from "nodegit";
import os from "os";
import path from "path";
import rimraf from "rimraf";
import {IGitMythXConfig} from "./GitMythXConfig";

export class GitRepo {

    private repo: Repository;

    public constructor(
        private readonly ownerId: number,
        private readonly fullRepoName: string,
        private readonly repository: string,
        private readonly branch: string,
        private readonly ref: string,
        private readonly installationToken: string) {

    }

    public async clone(): Promise<GitRepo> {
        const repoDir = path.join(os.tmpdir(), `${this.repository}-${this.ref}`);
        this.deleteDirectory(repoDir);
        this.repo = await Clone.clone(
          `https://x-access-token:${this.installationToken}@github.com/${this.fullRepoName}.git`,
            repoDir,
            {
                checkoutBranch: this.branch,
            },
        );
        await Reset.reset(this.repo, await this.repo.getCommit(this.ref), Reset.TYPE.HARD, {});
        return this;
    }

    public getDirectory(): string {
        return this.repo.workdir();
    }

    public getMythXConfigFile(): IGitMythXConfig {
        const rawData = this.getFile("./gitmythx.json");
        if (!rawData) { return null; }
        return JSON.parse(rawData);
    }

    public getFile(filePath: string): string {
        filePath = path.join(this.repo.workdir(), filePath);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return  fs.readFileSync(filePath, "utf-8");
    }

    public getOwner(): string {
        return this.ownerId.toString(10);
    }

    private deleteDirectory(dir: string): void {
        try {
            rimraf.sync(dir);
        } catch (ignored) {}
    }

}
