import {
  BadRequestException,
  ErrorCodes,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  withErrorHandling,
} from '@/core/exceptions';
import { extractJsonBody } from '@/core/utils/json-body-extractor';
import { User } from '@/payload-types';
import * as crypto from 'crypto';
import { PayloadRequest } from 'payload';

export const changePasswordHandler = withErrorHandling(async (req: PayloadRequest) => {
  const body = await extractJsonBody(req);
  const { oldPassword, newPassword } = body;

  validateRequestBody(oldPassword, newPassword, req.user);

  const userId = req.user!.id;

  const user = await req.payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    showHiddenFields: true,
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.hash || !user.salt) {
    throw new InternalServerException('User does not have a password set');
  }

  const isValid = comparePassword(oldPassword, user.hash!, user.salt!);

  if (!isValid) {
    throw new BadRequestException('Invalid old password', ErrorCodes.INVALID_OLD_PASSWORD);
  }

  await req.payload.update({
    collection: 'users',
    id: userId,
    data: {
      password: newPassword,
    },
  });

  return Response.json({ success: true });
});

const validateRequestBody = (oldPassword: string, newPassword: string, user: User | null): void => {
  if (!user) {
    throw new ForbiddenException('Unauthorized');
  }

  if (!oldPassword || !newPassword) {
    throw new BadRequestException('Both oldPassword and newPassword are required', ErrorCodes.INVALID_REQUEST_BODY);
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isLongEnough = newPassword.length >= minLength;

  if (!(hasUpperCase && hasLowerCase && hasNumber && isLongEnough)) {
    throw new BadRequestException(
      'New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.',
      ErrorCodes.WEAK_PASSWORD,
    );
  }
};

const comparePassword = (password: string, hash: string, salt: string): boolean => {
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex');
  return hashedPassword === hash;
};
