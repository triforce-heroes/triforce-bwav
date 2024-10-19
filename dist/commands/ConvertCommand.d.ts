interface ConvertCommandOptions {
    force?: boolean;
    keepTemps?: boolean;
    debug?: boolean;
    copy?: string;
}
export declare function ConvertCommand(options: ConvertCommandOptions): Promise<void>;
export {};
