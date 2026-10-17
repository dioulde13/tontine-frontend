import { Village } from './village.model';

// Reflète ReunionResponseDTO / CreateReunionRequestDTO (gn.projet.cotisation.dto.reunions)
export interface Reunion {
  id: number;
  village: Village;
  /** ISO-8601 LocalDateTime, ex: "2026-10-03T18:00:00" */
  dateHeure: string;
  lieu: string;
}

export interface CreateReunionRequest {
  dateHeure: string;
  lieu: string;
}
