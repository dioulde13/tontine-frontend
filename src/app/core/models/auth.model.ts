// Reflète LoginRequestDTO / LoginResponseDTO (gn.projet.cotisation.dto.utilisateurs)

export interface LoginRequest {
  telephone: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
}
