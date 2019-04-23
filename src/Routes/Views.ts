import * as armlet from "armlet";
import * as express from "express";
import config from "../Config/Config";
import {GithubUserService} from "../Services/Github/GithubUserService";

const router = express.Router();

router.get("/setup", async (req, res) => {
    if (!req.githubUser) {
        return res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${config.github.client.id}`,
        );
    }
    res.render("setup", {
        githubUser: req.githubUser,
    });
});

// TODO: should be done on client side
router.post("/mythx/login", async (req, res) => {
    const address = req.body.address;
    const password = req.body.password;
    const client = new armlet.Client({
        ethAddress: address,
        password,
    });
    await client.login();
    res.json({
        a: client.accessToken,
        b: client.refreshToken,
    });
});

router.get("/oauth/github", async (req, res) => {
    const accessToken = await new GithubUserService().getUserAccessCode(req.query.code);
    res.cookie("githubAuth", accessToken, {httpOnly: true, maxAge: 900000});
    res.redirect("/setup");
});

export default router;
