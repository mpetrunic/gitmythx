import * as armlet from "armlet";
import * as express from "express";
import config from "../Config/Config";
import CheckRunReport from "../Models/CheckRunReport";
import User from "../Models/User";
import {GithubUserService} from "../Services/Github/GithubUserService";
import logger from "../Services/Logger";

const router = express.Router();

router.get("/setup", async (req, res) => {
    if (!req.githubUser) {
        return res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${config.github.client.id}`,
        );
    }
    let mythxUser = await User.findOne({ where: { id: req.githubUser.id.toString() }});
    if (!mythxUser) {
        mythxUser = {
            accessToken: "Undefined",
            refreshToken: "Undefined",
        } as any;
    }
    res.render("setup", {
        githubUser: req.githubUser,
        mythxUser,
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
    const user = await User.findOne({ where: { id: req.githubUser.id.toString() }});
    user ?
        await user.update({ accessToken: client.accessToken, refreshToken: client.refreshToken })
        : await User.create(
            { id: req.githubUser.id.toString(), accessToken: client.accessToken, refreshToken: client.refreshToken },
            );
    res.redirect("/setup");
});

router.get("/oauth/github", async (req, res) => {
    const accessToken = await new GithubUserService().getUserAccessCode(req.query.code);
    res.cookie("githubAuth", accessToken, {httpOnly: true, maxAge: 900000});
    res.redirect("/setup");
});

router.get("/github/check/status/:checkRunId", async (req, res) => {
    const reports = await CheckRunReport.all({ where: {checkRunId: req.params.checkRunId}});
    const analysis = reports.map((report) => {
        return JSON.parse(report.report);
    });
    console.log(analysis);
    res.render("status", {
        analysis,
    });
});

export default router;
