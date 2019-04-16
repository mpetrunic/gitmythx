import * as express from "express";
import githubMiddleware from "../Services/Github/GithubWebhookMiddleware";
import GithubHookController from "../Controller/Hooks/GithubHookController";

const router = express.Router();

router.post("/hook", githubMiddleware, GithubHookController.hook);

export default router;
