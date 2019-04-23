import {NextFunction, Request, Response} from "express";
import {GithubUserService} from "./Github/GithubUserService";

export async function githubUserMiddleware(req: Request, res: Response, next: NextFunction) {
    const githubUserService = new GithubUserService(req.cookies.githubAuth);
    req.githubUser = await githubUserService.getUserDetails();
    next();
}
