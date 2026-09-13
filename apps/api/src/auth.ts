import { PrivyClient } from "@privy-io/server-auth";

export type AuthVerifier = {
  verifyAuthorization(authorization: string | undefined): Promise<string>;
};

export class AuthenticationError extends Error {}

export function createPrivyAuthVerifier(
  appId: string,
  appSecret: string,
): AuthVerifier {
  const client = new PrivyClient(appId, appSecret);

  return {
    async verifyAuthorization(authorization) {
      const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) throw new AuthenticationError("Authentication required");

      try {
        const claims = await client.verifyAuthToken(token);
        return claims.userId;
      } catch {
        throw new AuthenticationError(
          "Invalid or expired authentication token",
        );
      }
    },
  };
}
