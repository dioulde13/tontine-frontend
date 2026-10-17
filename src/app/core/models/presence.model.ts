import { Reunion } from './reunion.model';
import { Utilisateur } from './utilisateur.model';

// Reflète PresenceResponseDTO / CreatePresenceRequestDTO (gn.projet.cotisation.dto.presences)
export interface Presence {
  id: number;
  reunion: Reunion;
  utilisateur: Utilisateur;
  present: boolean;
}

export interface CreatePresenceRequest {
  utilisateurId: number;
  present: boolean;
}
