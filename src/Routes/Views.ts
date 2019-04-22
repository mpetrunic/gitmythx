import * as express from "express";
import config from "../Config/Config";
import {GithubUserService} from "../Services/Github/GithubUserService";

const router = express.Router();

router.get("/setup", async (req, res) => {
    const githubUserService = new GithubUserService(req.cookies.githubAuth);
    const githubUser = await githubUserService.getUserDetails();
    if (!githubUser) {
        return res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${config.github.client.id}`,
        );
    }
    res.render("setup", {
        githubUser,
    });
});

router.get("/oauth/github", async (req, res) => {
    const accessToken = await new GithubUserService().getUserAccessCode(req.query.code);
    res.cookie("githubAuth", accessToken, {httpOnly: true, maxAge: 900000});
    res.redirect("/setup");
});

export default router;
