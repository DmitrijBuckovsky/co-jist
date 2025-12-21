import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad request', errorCode?: string) {
    super(400, { message, errorCode });
  }
}
