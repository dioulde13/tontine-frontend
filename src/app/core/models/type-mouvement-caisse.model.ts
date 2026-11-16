// Reflète TypeMouvementCaisseResponseDTO / UpdateTypeMouvementCaisseRequestDTO
// (gn.projet.cotisation.dto.typemouvementcaisse) — catégorie de dépense configurée par le
// président pour SON village (ex: "Mariage", "Baptême", "Décès"). Aucune valeur n'est pré-remplie :
// la liste part vide, le président l'alimente lui-même.
export interface TypeMouvementCaisse {
  id: number;
  libelle: string;
}

export interface UpdateTypeMouvementCaisseRequest {
  libelle: string;
}
