import * as fs from "fs";
import * as path from "path";
import * as solc from "solc";
import logger from "./Logger";

export class SolidityUtils {

    public static getImportPaths(source: string): string[] {
        const matches = [];
        const ir = /^(.*import){1}(.+){0,1}\s['"](.+)['"];/gm;
        let match = ir.exec(source);

        while (match) {
            matches.push(match[3]);
            match = ir.exec(source);
        }

        return matches;
    }

    public static removeRelativePathFromUrl(url: string): string {
        return url
            .replace(/^.+\.\//, "")
            .replace("./", "");
    }

    public static replaceLinkedLibs(byteCode: string): string {
        /* Dynamic linking is not supported. */

        const regex = new RegExp(/__\$\w+\$__/, "g");
        const address = "0000000000000000000000000000000000000000";

        return byteCode.replace(regex, address);
    }

    public static parseImports(dir, importPath, updateSourcePath = false): object {
        let sourceList = {};
        try {
            const relativeFilePath = path.join(dir, importPath);
            const relativeFileDir = path.dirname(relativeFilePath);

            if (fs.existsSync(relativeFilePath)) {
                const content = fs.readFileSync(relativeFilePath).toString();
                const imports = SolidityUtils.getImportPaths(content);
                const newSourceList = imports.map(
                    (p) =>
                        SolidityUtils
                            .parseImports(
                                relativeFileDir,
                                p,
                                !(p.startsWith("./") && importPath.startsWith("./")),
                            ),
                ).reduce((previousValue, currentValue) => {
                    return {...previousValue, ...currentValue};
                });

                sourceList = {
                    ...sourceList,
                    ...newSourceList,
                };

                let sourceUrl = SolidityUtils.removeRelativePathFromUrl(importPath);
                if (updateSourcePath && importPath.startsWith("./")) {
                    sourceUrl = relativeFileDir.split(path.sep).pop() + "/" + sourceUrl;
                }

                if (!sourceList[sourceUrl]) {
                    sourceList[sourceUrl] = { content };
                }
                return sourceList;
            }
        } catch (err) {
            throw new Error(`Import ${importPath} not found`);
        }

    }

    public static async compile(solcInput: any, solidityVersion: string): Promise<any> {
        return new Promise((resolve, reject) => {
            logger.info(`Fetching solc compiler for version ${solidityVersion}`);
            solc.loadRemoteVersion(solidityVersion, (err, solcSnapshot) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info("Compiling contracts...");
                    try {
                        resolve(JSON.parse(solcSnapshot.compile(JSON.stringify(solcInput))));
                    } catch (e) {
                        reject(`Failed to compile contracts with solc ${solidityVersion}`);
                    }
                }
            });
        });
    }
}
