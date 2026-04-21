import jwt from "jsonwebtoken";
import { blacklistedTokens } from "./blacklist/blacklist";

export function Auth(request: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new Error("Authorization header is missing.");
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.trim();
  if (!token) {
    throw new Error("Token is missing from the authorization header.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload; // decode token
    const tokenId = decoded.userId as string; // get ID from decoded token

    // Check if token is blacklisted
    if (blacklistedTokens.has(tokenId)) {
      throw new Error("Token is blacklisted.");
    }

    return true; // Token is valid

  } catch (err) {
    console.error("Authentication error:", err);
    return false; // Token verification failed
  }
}
