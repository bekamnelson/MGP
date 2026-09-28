import { Intervalle, Matiere, Systeme } from '../context/GradeContext';

// Tolérance pour les erreurs d'arrondi des nombres à virgule (ex: 65 / 5)
const EPSILON = 1e-9;

// Tranche du barème (défini sur 20) correspondant à une note sur 20.
// Chaque tranche va de son minimum jusqu'au minimum de la tranche suivante (exclu) :
// une note comme 17.995/20 ou 89.99/100 ne tombe donc jamais entre deux tranches.
export const trouverIntervalle = (noteSur20: number, intervalles: Intervalle[]) =>
    intervalles
        .filter(i => noteSur20 + EPSILON >= i.min)
        .sort((a, b) => b.min - a.min)[0];

// Tranche correspondant à une MGP : la plus haute dont la MGP est atteinte
export const trouverIntervalleParMgp = (mgp: number, intervalles: Intervalle[]) =>
    intervalles
        .filter(i => mgp + EPSILON >= i.gpa)
        .sort((a, b) => b.gpa - a.gpa)[0];

// Convertit une note saisie dans le système choisi en note sur 20
export const versSur20 = (note: number, systeme: Systeme) => (note * 20) / systeme;

export const calculerResultats = (
    matieres: Matiere[],
    notes: { [key: string]: string },
    intervalles: Intervalle[],
    systeme: Systeme = 20
) => {
    let sommePonderee = 0;
    let sommePQ = 0;
    let totalCredits = 0;

    matieres.forEach(m => {
        const noteVal = parseFloat(notes[m.id]);

        // On s'assure que la note est un nombre valide avant de calculer
        if (!isNaN(noteVal) && m.cr > 0) {
            const cr = m.cr;
            sommePonderee += noteVal * cr;

            // Si aucune correspondance n'est trouvée, on attribue 0 par défaut
            const gpa = trouverIntervalle(versSur20(noteVal, systeme), intervalles)?.gpa ?? 0;

            sommePQ += gpa * cr;
            totalCredits += cr;
        }
    });

    // Évite la division par zéro si aucune note n'a encore été saisie
    if (totalCredits === 0) return { moyenne: "0.00", mgp: "0.00", grade: "-", appreciation: "" };

    const mgp = sommePQ / totalCredits;
    const tranche = trouverIntervalleParMgp(mgp, intervalles);

    return {
        moyenne: (sommePonderee / totalCredits).toFixed(2),
        mgp: mgp.toFixed(2),
        grade: tranche?.grade ?? "-",
        appreciation: tranche?.appreciation ?? ""
    };
};
