interface ConvertCommandOptions {
    force?: boolean;
    keepTemps?: boolean;
    copy?: string;
}
export declare function ConvertCommand(options: ConvertCommandOptions): Promise<void>;
export {};
