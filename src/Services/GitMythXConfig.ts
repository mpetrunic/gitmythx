export interface IGitMythXConfig {
    solidityVersion: string;
    contracts: IContractConfig[];
}

interface IContractConfig {
    name: string;
    // relative to giithub repo root
    path: string;
}
