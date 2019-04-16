import App from "@octokit/app";
import fs from "fs";
import config from "../../Config/Config";

export class GithubApp {

    private app: App;

    constructor() {
        this.app = new App({
            id: parseInt(config.github.app.id, 10),
            privateKey: this.getPrivateKey(config.github.app.privateKeyLocation),
        });
    }

    public getInstallationToken(installationId: number): Promise<string> {
        return this.app.getInstallationAccessToken({ installationId });
    }

    public getJwt(): string {
        return this.app.getSignedJsonWebToken();
    }

    private getPrivateKey(privateKeyFileLocation: string): string {
        return fs.readFileSync(privateKeyFileLocation).toString("utf-8");
    }
}

export default new GithubApp();
