// tslint:disable:interface-name

export enum EventAction {
    REQUESTED = "requested",
    REREQUESTED = "rerequested",
    COMPLETED = "completed",
    CREATED = "created",
}

export enum CheckRunStatus {
    QUEUED = "queued",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
}

export enum CheckRunConclusion {
    SUCCESS = "success",
    FAILURE = "failure",
}

interface App {
    id: number;
}

interface Check {
    id: number;
    head_branch: string;
    head_sha: string;
}

interface CheckSuite extends Check {
    check_suite?: any;
}

interface CheckRun extends Check {
    status: CheckRunStatus;
    app: App;
}

interface Owner {
    id: number;
    login: string;
}

interface Repository {
    full_name: string;
    name: string;
    owner: Owner;
}

export interface GithubEvent {
    action: EventAction;
    app: App;
    check_suite?: CheckSuite;
    check_run?: CheckRun;
    repository: Repository;
}
