import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class SanitizePipe implements PipeTransform {
    private readonly defaultOptions;
    transform(value: any, metadata: ArgumentMetadata): any;
    private sanitizeString;
}
export declare class HtmlSanitizePipe implements PipeTransform {
    private readonly options;
    transform(value: any, metadata: ArgumentMetadata): any;
}
