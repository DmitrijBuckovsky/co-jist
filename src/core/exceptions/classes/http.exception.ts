export interface HttpExceptionOptions {
  message: string;
  errorCode?: string;
  cause?: Error;
}

export abstract class HttpException extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly cause?: Error;

  constructor(statusCode: number, options: HttpExceptionOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = options.errorCode;
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public shouldLogToSentry(): boolean {
    return this.statusCode >= 500;
  }

  public toResponse(): Response {
    const body: { errors: Array<{ message: string }>; errorCode?: string } = {
      errors: [{ message: this.message }],
    };

    if (this.errorCode) {
      body.errorCode = this.errorCode;
    }

    return Response.json(body, { status: this.statusCode });
  }
}
