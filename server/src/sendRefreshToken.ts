import { Response } from 'express';

export const sendRefreshToken = (res: Response, token: String) => {
  // login successful
  res.cookie('jid', token, {
    httpOnly: true,
  });
};
