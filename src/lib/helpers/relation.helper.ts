/**
 * Certaines relations ManyToOne du backend (ex: Residence.proprietaire) sont typées
 * `string` mais renvoient parfois l'entité hydratée (objet) selon que la relation ait
 * été jointe ou non côté API. Cette fonction normalise les deux cas vers un simple ID.
 */
export function extractRelationId(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object" && "id" in value) return (value as { id: string }).id;
    return undefined;
}
