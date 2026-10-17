interface JwtPayload {
  /** Téléphone de l'utilisateur : JwtService.generateToken() pose userDetails.getUsername() (= téléphone) comme "subject". */
  sub: string;
  iat: number;
  exp: number;
}

/** Décode la partie payload d'un JWT (base64url) sans vérifier la signature — la signature est vérifiée côté serveur. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return true;
  }
  return payload.exp * 1000 <= Date.now();
}
