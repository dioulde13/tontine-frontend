// Reflète ErrorResponse (gn.projet.cotisation.exception), produit par GlobalExceptionHandler
// pour CHAQUE erreur métier (404, 403, 409, 400, 401, 500...).
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
