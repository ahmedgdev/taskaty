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
  const { authorization } = req.headers;
  let token;

  if (authorization?.startsWith('Bearer ')) {
    token = authorization.split(' ')[1];
  }

  return token;
};

export const signToken = async (id) => {
  const secret = getSecretKey();
  const token = await new SignJWT({ id })
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
