# GitMythX
[![GitHub license](https://img.shields.io/github/license/NodeFactoryIo/node-ts-starter.svg)](https://github.com/NodeFactoryIo/node-ts-starter/blob/master/LICENSE)


Repo containing github app for running MythX security checks.

## Example
- example repo: https://github.com/mpetrunic/GitMythx-example
    - commit check - success - https://github.com/mpetrunic/GitMythx-example/commits/master
    - PR check - failed - https://github.com/mpetrunic/GitMythx-example/pull/1
        - issue viewer for PR: https://gitmythx.nodefactory.io/github/check/status/115227721

## Usage

- Install [GitMythX](https://github.com/apps/gitmythx) to your smart contract repo
- After installation you will be redirected to obtain MythX credentials
    - You can create MythX account [here](https://mythx.io/)
- Add `gitmythx.json` file to root of your repo

Example of `gitmythx.json` file:
```json
{
  // full version including commit
  "solidityVersion": "v0.5.1+commit.c8a2cb62",
  "contracts": [
    //create this object for each contract you want to be run against security check
    {
      "name": "TestContract",
      //relative to github repo root
      "path": "./contracts/TestContract.sol"
    }
  ]
}
```

## Development

Following software is required to be installed to use this repo:
 * [NodeJs](https://nodejs.org/en/) >= v8.4.0
 * [Yarn](https://yarnpkg.com/en/docs/install#debian-stable)
 * Docker
 * docker-compose

### Usage

#### Creating github app
- Go to: Github -> Settings -> Developer settings -> Github Apps -> New Github App
- Put some dummy urls (you will update urls after you start app locally)
- Check `Redirect on update`
- Permissions:
    - Checks: Read & Write
    - Repository contents: Read-only
    - Pull requests: Read & Write
- Subscribe to following events:
    - Check suite
    - Check run
- Generate private key and save as `pk.pem` in root of application 

#### Running application locally

On first use of this repo, run `npx run build` which will
build docker image.You will have to run `npx run build` each time
you change dependencies in package.json (yarn.lock).

Copy `.env.sample` into `.env` and fill out env variables, some fields can only be populated after creating of github app.

Using `npx run dev` will start all required docker containers, execute migrations etc.

Since github requires https hook, install [ngrok](https://ngrok.com/) or something similar
and in new terminal run `ngrok http 3000`. Copy generated https tunnel.

Update following props in GithubApp:
- Homepage URL: <ngrok tunnel>
- User authorization callback URL: <ngrok tunnel>/oauth/github
- Setup URL (optional): <ngrok tunnel>/setup
- Webhook URL: <ngrok tunnel>/github/hook
- Webhook secret: <copy GITHUB_WEBHOOK_SECRET from .env>


Run `npx run` to see all available commands and their description.

## Notice
* make sure you update yarn.lock before building
* use sequelize-cli local to generate migrations (because of timestamp)
