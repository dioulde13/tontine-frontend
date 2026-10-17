import { Role } from './role.model';
import { Village } from './village.model';

// Reflète UtilisateurResponseDTO (gn.projet.cotisation.dto.utilisateurs)
export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  /** Sert aussi d'identifiant de connexion (voir LoginRequest) ; unique côté backend. */
  telephone: string;
  roles: Role[];
  village: Village | null;
  villagesGeres: Village[];
}

// Reflète UpdateUtilisateurRequestDTO : création/modification par un ADMIN.
export interface UpdateUtilisateurRequest {
  nom: string;
  prenom: string;
  telephone: string;
  /**
   * null pour ne pas changer le mot de passe actuel. Ignoré à la création (le mot de passe initial
   * est toujours le numéro de téléphone, fixé par le backend) ; pris en compte à la modification
   * seulement si le téléphone ne change pas (sinon le backend resynchronise motDePasse = nouveau téléphone).
   */
  motDePasse: string | null;
  roleIds: number[];
  villageId: number | null;
  villagesGeresIds: number[];
}

// Reflète CreateMembreRequestDTO : création d'un membre par le président d'un village.
// Pas de motDePasse : le mot de passe initial est TOUJOURS le numéro de téléphone, fixé par le backend.
export interface CreateMembreRequest {
  nom: string;
  prenom: string;
  telephone: string;
}

/** Noms de rôle connus côté backend (constante MEMBRE dans UtilisateurServiceImpl, ADMIN/PRESIDENT par convention). */
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_PRESIDENT = 'PRESIDENT';
export const ROLE_MEMBRE = 'MEMBRE';

export function utilisateurNomComplet(utilisateur: Utilisateur): string {
  return `${utilisateur.prenom} ${utilisateur.nom}`;
}
