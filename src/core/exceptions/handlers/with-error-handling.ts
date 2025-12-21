import { HttpException } from '../classes/http.exception';
import { InternalServerException } from '../classes/internal-server.exception';

import { NotFoundException } from '../classes';
import { PayloadHandler, PayloadRequest } from 'payload';

export const withErrorHandling = (handler: (req: PayloadRequest) => Promise<Response>): PayloadHandler => {
  return async (req: PayloadRequest): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error: any) {
      if (error instanceof HttpException) {
        if (error.shouldLogToSentry()) {
          console.error('HTTP Exception:', error);
          // Sentry.captureException(error, {
          //   extra: {
          //     statusCode: error.statusCode,
          //     errorCode: error.errorCode,
          //     path: req.url,
          //     method: req.method,
          //     userId: req.user?.id,
          //   },
          // });
        }
        return error.toResponse();
      }

      // Unknown errors - log to console + Sentry
      console.error('Unhandled error:', error);

      // DB return 404 if item is not found by ID
      if (error.status == 404) {
        return new NotFoundException('Resource not found').toResponse();
      }

      // Sentry.captureException(error, {
      //   extra: {
      //     path: req.url,
      //     method: req.method,
      //     userId: req.user?.id,
      //   },
      // })

      return new InternalServerException().toResponse();
    }
  };
};
