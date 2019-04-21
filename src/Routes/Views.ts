import * as express from "express";
import config from "../Config/Config";
import {GithubUserService} from "../Services/Github/GithubUserService";

const router = express.Router();

router.get("/setup", async (req, res) => {
    const githubUser = new GithubUserService();
    if (!await githubUser.hasValidAccessToken(req.cookies.githubAuth)) {
        return res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${config.github.client.id}`,
        );
    }
    res.render("setup");
});

router.get("/oauth/github", async (req, res) => {
    const accessToken = await new GithubUserService().getUserAccessCode(req.query.code);
    res.cookie("githubAuth", accessToken, {httpOnly: true, maxAge: 900000});
    res.redirect("/setup");
});

export default router;
