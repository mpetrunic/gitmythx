// Ensure this is treated as a module.
import {GithubUser} from "./Services/Github/GithubUserService";

export {};

declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        export interface Request {
            githubUser?: GithubUser;
        }
    }
}
