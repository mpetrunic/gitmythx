import SourceMappingDecoder = require("remix-lib/src/sourceMappingDecoder");
import logger from "../Logger";

export class AnalysisReport {

    public readonly uuid: string;

    public readonly issues: IMythxIssue[];

    public readonly contractFilePath: string;

    private decoder: SourceMappingDecoder;

    constructor(
        public readonly success: boolean,
        public readonly message: string,
        mythxRequest?: any,
        mythxResult?: any) {
        this.decoder = new SourceMappingDecoder();
        if (mythxResult && mythxRequest) {
            this.contractFilePath = mythxRequest.mainSource;
            this.uuid = mythxResult.status.uuid;
            this.issues = mythxResult.issues
                .map((issue) => this.convertMythxIssue(issue, mythxRequest))
                .reduce((curr, arr) => curr.concat(arr), []);
        }
    }

    public isFatal(): boolean {
        let severeCount = 0;
        this.issues.forEach((issue) => {
            if (issue.severity !== "Low") { severeCount++; }
        });
        return severeCount > 0;
    }

    private convertMythxIssue(report: any, mythxRequest: any): IMythxIssue[] {
        const { issues } = report;
        return issues.map((issue) => {
            try {
                const mythxIssue = {
                    swcID: issue.swcID,
                    swcTitle: issue.swcTitle,
                    description: issue.description.tail,
                    location: "undefined",
                    severity: issue.severity,
                } as IMythxIssue;
                const source = mythxRequest.sources[this.contractFilePath].content;
                if (source) {
                    const lineBreakPositions = this.decoder.getLinebreakPositions(source);
                    let startLineCol;
                    if (issue.locations.length) {
                        const srcEntry = issue.locations[0].sourceMap.split(";")[0];
                        [startLineCol] = this.textSrcEntry2lineColumn(srcEntry, lineBreakPositions);
                    }
                    if (startLineCol) {
                        mythxIssue.location = startLineCol.line + ":" + startLineCol.column;
                    }
                }
                return mythxIssue;
            } catch (e) {
                logger.error(e.message);
            }

        });
    }

    private getSourceIndex(issue: any) {
        if (issue.locations.length) {
            const sourceMapRegex = /(\d+):(\d+):(\d+)/g;
            const match = sourceMapRegex.exec(issue.locations[0].sourceMap);
            // Ignore `-1` source index for compiler generated code
            return match ? match[3] : 0;
        }

        return 0;
    }

    private textSrcEntry2lineColumn(srcEntry: string, lineBreakPositions: any) {
        const ary = srcEntry.split(":");
        const sourceLocation = {
            length: parseInt(ary[1], 10),
            start: parseInt(ary[0], 10),
        };
        const loc = this.decoder.convertOffsetToLineColumn(sourceLocation, lineBreakPositions);
        // FIXME: note we are lossy in that we don't return the end location
        if (loc.start) {
            // Adjust because routines starts lines at 0 rather than 1.
            loc.start.line++;
        }
        if (loc.end) {
            loc.end.line++;
        }
        return [loc.start, loc.end];
    }
}

export interface IMythxIssue {
    swcID: string;
    swcTitle: string;
    description: string;
    location: string;
    severity: string;
}
