import {file} from "babel-types";
import * as fs from "fs";
import {Clone, Repository} from "nodegit";
import os from "os";
import path from "path";
import rimraf from "rimraf";
import {IGitMythXConfig} from "./GitMythXConfig";
import logger from "./Logger";

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
        const commit = await this.repo.getCommit(this.ref);
        await this.repo.setHeadDetached(commit.id());
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
