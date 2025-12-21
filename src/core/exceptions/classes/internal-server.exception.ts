import { HttpException } from './http.exception';

export class InternalServerException extends HttpException {
  constructor(message: string = 'Internal server error', cause?: Error) {
    super(500, { message, cause });
  }
}
