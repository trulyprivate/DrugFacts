declare const _default: (() => {
    uri: string;
    name: string;
    options: {
        autoIndex: boolean;
        maxPoolSize: number;
        minPoolSize: number;
        serverSelectionTimeoutMS: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uri: string;
    name: string;
    options: {
        autoIndex: boolean;
        maxPoolSize: number;
        minPoolSize: number;
        serverSelectionTimeoutMS: number;
    };
}>;
export default _default;
