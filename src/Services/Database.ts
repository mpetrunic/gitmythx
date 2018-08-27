import * as path from "path";
import * as Sequelize from "sequelize";
import * as Umzug from "umzug";
import config from "../Config/Config";
import Models from "../Models";
import logger from "../Services/Logger";

class Database {

    public sequelize: Sequelize.Sequelize;

    public models: object = {};

    private migrations: Umzug;

    constructor() {
       this.sequelize = new Sequelize.Sequelize(
            config.db.database,
            config.db.user,
            config.db.password,
           {
                dialect: config.db.dialect,
                host: config.db.host,
                logging: logger.info,
                native: false,
                pool: {
                    acquire: 30000,
                    idle: 10000,
                    max: 5,
                    min: 0,
                },
            });
       this.migrations = new Umzug({
            storage: "sequelize",

            storageOptions: {
                sequelize: this.sequelize,
            },

            migrations: {
                params: [
                    this.sequelize.getQueryInterface(),
                    Sequelize,
                ],
                path: path.join(__dirname, "../Migrations"),
            },
        });

    }

    public async init(): Promise<Sequelize> {
        await this.waitForDb();
        await this.runMigrations();
        this.initModels();
        return this.sequelize;
    }

    private async waitForDb() {
        while (true) {
            try {
                logger.info(`Connecting to database at ${config.db.host}:3306`);
                await this.sequelize.authenticate();
                logger.info("Database connection has been established successfully.");
                break;
            } catch (e) {
                logger.error("Unable to connect to the database:", e);
                logger.info("Retrying in 3s...");
                await this.sleep(3000);
            }
        }
    }

    private async runMigrations() {
        // Run migrations if not testing
        if (config.env !== "test") {
            logger.info("Running migrations...");
            await this.migrations.up();
            logger.info("Migrations executed successfully");
        }
    }

    private initModels() {
        Object.keys(Models).forEach((prop) => {
            this.models[prop] = Models[prop].init(this.sequelize, Sequelize);
        });
        // Run `.associate` if it exists,
        // ie create relationships in the ORM
        Object.keys(this.models)
            .map((value) => Models[value])
            .filter((model) => typeof model.associate === "function")
            .forEach((model) => model.associate(this.models));
    }

    private sleep(ms) {

        // eslint-disable-next-line no-undef
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

export default new Database();
