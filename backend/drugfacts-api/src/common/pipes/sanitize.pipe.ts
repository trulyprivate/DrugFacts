import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  };

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item, metadata));
    }

    if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.transform(val, metadata);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(value: string): string {
    // Remove HTML tags and potential XSS vectors
    let sanitized = sanitizeHtml(value, this.defaultOptions);
    
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  }
}

@Injectable()
export class HtmlSanitizePipe implements PipeTransform {
  private readonly options: sanitizeHtml.IOptions = {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        };
      },
    },
  };

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      return value;
    }

    return sanitizeHtml(value, this.options);
  }
}