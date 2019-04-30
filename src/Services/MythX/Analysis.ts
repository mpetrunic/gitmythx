import * as armlet from "armlet";
import * as path from "path";
import User from "../../Models/User";
import {IGitMythXConfig} from "../GitMythXConfig";
import {GitRepo} from "../GitRepo";
import logger from "../Logger";
import {SolidityUtils} from "../SolidityUtils";
import {AnalysisReport} from "./AnalysisReport";

export class Analysis {

    private readonly config: IGitMythXConfig;

    constructor(private readonly repo: GitRepo) {
        this.config = repo.getMythXConfigFile();
    }

    public async run(): Promise<AnalysisReport[] | AnalysisReport> {
        if (!this.config) {
            logger.error("Missing gitmythx.json config in repo");
            return new AnalysisReport(
                false,
                "Missing gitmythx.json config in repo",
            );
        }
        return await Promise.all(
          this.config.contracts.map((contractConfig) => {
            return this.runAnalyses(contractConfig.name, this.repo.getFile(contractConfig.path));
          }),
        );

    }

    private async runAnalyses(contractFilePath: string, contractSource: string): Promise<AnalysisReport> {
        try {
            const contractFileName = path.basename(contractFilePath);
            const solcInput = {
                language: "Solidity",
                sources: {
                    [contractFileName]: {
                        content: contractSource,
                    },
                },
                settings: {
                    outputSelection: {
                        "*": {
                            "*": ["*"],
                            "": ["ast"],
                        },
                    },
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            };
            logger.info("Processing contract import paths");
            const importPaths = SolidityUtils.getImportPaths(contractSource);
            let sourceList = {};
            importPaths.forEach((importPath) => {
                const newSourceList = SolidityUtils.parseImports(path.dirname(contractFilePath), importPath, false);
                sourceList = {
                    ...sourceList,
                    ...newSourceList,
                };
            });
            solcInput.sources = {
                ...solcInput.sources,
                ...sourceList,
            };
            const mythxSourceList = Object.keys(sourceList);
            mythxSourceList.push(contractFileName);
            const compiled =  await SolidityUtils.compile(solcInput, this.config.solidityVersion);
            if (!compiled.contracts || !Object.keys(compiled.contracts).length) {
                if (compiled.errors) {
                    for (const compiledError of compiled.errors) {
                        logger.error(compiledError.formattedMessage);
                    }
                }
                return new AnalysisReport(
                    false,
                    "Failed to compšile contracts",
                );
            }

            const inputfile = compiled.contracts[contractFileName];
            let contract;
            let contractName;

            if (inputfile.length === 0) {
                logger.error("✖ No contracts found");
                return new AnalysisReport(
                    false,
                    "✖ No contracts found",
                );
            } else if (inputfile.length === 1) {
                contractName = Object.keys(inputfile)[0];
                contract = inputfile[contractName];
            } else {

                /*
                 * Get the contract with largest bytecode object to generate MythX analysis report.
                 * If inheritance is used, the main contract is the largest as it contains the bytecode of all others.
                */

                const bytecodes = {};

                for (const key in inputfile) {
                    if (inputfile.hasOwnProperty(key)) {
                        bytecodes[inputfile[key].evm.bytecode.object.length] = key;
                    }
                }

                const largestBytecodeKey = Object.keys(bytecodes).reverse()[0];
                contractName = bytecodes[largestBytecodeKey];
                contract = inputfile[contractName];
            }

            /* Bytecode would be empty if contract is only an interface */

            if (!contract.evm.bytecode.object) {
                logger.error(
                    "✖ Compiling the Solidity code did not return any bytecode." +
                    " Note that abstract contracts cannot be analyzed.",
                );
                return new AnalysisReport(
                    false,
                    "✖ Compiling the Solidity code did not return any bytecode." +
                    " Note that abstract contracts cannot be analyzed.");
            }

            /* Format data for MythX API */
            logger.info("Formatting mythx request...");
            const data = {
                contractName,
                bytecode: SolidityUtils.replaceLinkedLibs(contract.evm.bytecode.object),
                sourceMap: contract.evm.bytecode.sourceMap,
                deployedBytecode: SolidityUtils.replaceLinkedLibs(contract.evm.deployedBytecode.object),
                deployedSourceMap: contract.evm.deployedBytecode.sourceMap,
                mythxSourceList,
                analysisMode: "quick",
                sources: {},
                mainSource: contractFileName,
            } as any;

            // tslint:disable-next-line:forin
            for (const key in solcInput.sources) {
                data.sources[key] = { source: solcInput.sources[key].content };
            }
            logger.info(`Fetching mythx credentials for user ${this.repo.getOwner()}`);
            const mythxUser = await User.findOne({ where: { id: this.repo.getOwner() }});
            if (!mythxUser) {
                logger.error(`Missing mythx credentials for user ${this.repo.getOwner()}`);
                return new AnalysisReport(false, `Missing mythx credentials for user ${this.repo.getOwner()}`);
            }
            const client = new armlet.Client({
                ethAddress: "0x",
                password: "sample",
            });
            client.accessToken = mythxUser.accessToken;
            client.refreshToken = mythxUser.refreshToken;
            logger.info("Submitting contracts to mythx analysis");
            const result = await client.analyzeWithStatus({
                data,
                timeout: 300000,
                clientToolName: "GitMythX",
            });

            /* Add `solidity_file_path` to display the result in the ESLint format with the provided input path */
            data.filePath = contractFilePath;

            /* Add all the imported contracts source code to the `data` to sourcemap the issue location */
            data.sources = { ...solcInput.sources };
            logger.info("Creating analysis report...");
            const report = new AnalysisReport(true, "", data, result);
            logger.info("Created report!");
            logger.info(JSON.stringify(report));
            return report;
        } catch (e) {
            logger.error(e.message ? e.message : e);
            return new AnalysisReport(
                false,
                e.message ? e.message : e,
            );
        }

    }

}
