import { Intervalle, Matiere } from '../context/GradeContext';

export const calculerResultats = (
    matieres: Matiere[],
    notes: { [key: string]: string },
    intervalles: Intervalle[]
) => {
    let sommePonderee = 0;
    let sommePQ = 0;
    let totalCredits = 0;

    matieres.forEach(m => {
        const noteVal = parseFloat(notes[m.id]);

        // On s'assure que la note est un nombre valide avant de calculer
        if (!isNaN(noteVal)) {
            const cr = m.cr;
            sommePonderee += noteVal * cr;

            // Recherche de la correspondance d'intervalle pour le MGP
            const intervalleMatch = intervalles.find(
                i => noteVal >= i.min && noteVal <= i.max
            );

            // Si aucune correspondance n'est trouvée, on attribue 0 par défaut
            const gpa = intervalleMatch ? intervalleMatch.gpa : 0;

            sommePQ += gpa * cr;
            totalCredits += cr;
        }
    });

    // Évite la division par zéro si aucune note n'a encore été saisie
    if (totalCredits === 0) return { moyenne: "0.00", mgp: "0.00" };

    return {
        moyenne: (sommePonderee / totalCredits).toFixed(2),
        mgp: (sommePQ / totalCredits).toFixed(2)
    };
};