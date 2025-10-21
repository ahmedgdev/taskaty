import { SignJWT, jwtVerify } from 'jose';
import '../../config/loadEnv.js';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return new TextEncoder().encode(secret);
};

export const extractToken = (req) => {
  const cookies = req.cookies;
  // const { authorization } = req.headers;
  let token;

  if (cookies?.jwt) {
    token = cookies.jwt;
  }
  // else if (authorization?.startsWith('Bearer ')) {
  //   token = authorization.split(' ')[1];
  // }

  return token;
};

export const signToken = async (id) => {
  const secret = getSecretKey();
  const token = await new SignJWT({ id: id.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN)
    .sign(secret);

  return token;
};

export const verifyToken = async (token) => {
  const secret = getSecretKey();
  const { payload } = await jwtVerify(token, secret);
  return payload;
};

export const setJwtCookie = (res, token) => {
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d from issuing time
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);
};
