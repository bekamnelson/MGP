import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

export interface Matiere {
    id: string;
    nom: string;
    cr: number;
}

export interface Intervalle {
    id: string;
    min: number;
    max: number;
    gpa: number;
    grade?: string;
    appreciation?: string;
}

export type Notes = { [idMatiere: string]: string };

// Système de notation : notes sur 20 ou sur 100 (le barème reste défini sur 20)
export type Systeme = 20 | 100;

interface GradeContextType {
    matieres: Matiere[];
    intervalles: Intervalle[];
    notes: Notes;
    systeme: Systeme;
    sauvegarderMatieres: (nouvellesMatieres: Matiere[]) => Promise<void>;
    sauvegarderIntervalles: (nouveauxIntervalles: Intervalle[]) => Promise<void>;
    sauvegarderNotes: (nouvellesNotes: Notes) => Promise<void>;
    changerSysteme: (nouveauSysteme: Systeme) => Promise<void>;
}

// Valeurs par défaut adaptées au système universitaire (ex: Cameroun/LMD)
const MATIERES_DEFAULT: Matiere[] = [
    { id: '1', nom: "Formation bilingue 1", cr: 2 },
    { id: '2', nom: "EPS 1", cr: 1 },
    { id: '3', nom: "Electromagnétisme 1", cr: 4 },
    { id: '4', nom: "TP Physique", cr: 4 },
    { id: '5', nom: "Mécanique du point", cr: 4 },
    { id: '6', nom: "Chimie générale", cr: 4 },
    { id: '7', nom: "Algèbre générale", cr: 4 },
    { id: '8', nom: "Analyse réelle 1", cr: 4 },
    { id: '9', nom: "Algorithmique", cr: 3 },
    { id: '10', nom: "ECM", cr: 1 }
];

// Barème MGP par défaut
export const INTERVALLES_DEFAULT: Intervalle[] = [
    { id: '1', min: 18, max: 20, gpa: 4.0, grade: 'A+', appreciation: 'Excellent' },
    { id: '2', min: 16, max: 17.99, gpa: 3.7, grade: 'A', appreciation: 'Très Bien' },
    { id: '3', min: 14, max: 15.99, gpa: 3.3, grade: 'B+', appreciation: 'Bien' },
    { id: '4', min: 13, max: 13.99, gpa: 3.0, grade: 'B', appreciation: 'Assez Bien' },
    { id: '5', min: 12, max: 12.99, gpa: 2.7, grade: 'B-', appreciation: 'Assez Bien' },
    { id: '6', min: 11, max: 11.99, gpa: 2.3, grade: 'C+', appreciation: 'Passable' },
    { id: '7', min: 10, max: 10.99, gpa: 2.0, grade: 'C', appreciation: 'Passable' },
    { id: '8', min: 9, max: 9.99, gpa: 1.7, grade: 'C-', appreciation: 'Insuffisant' },
    { id: '9', min: 8, max: 8.99, gpa: 1.3, grade: 'D', appreciation: 'Faible' },
    { id: '10', min: 7, max: 7.99, gpa: 1.0, grade: 'E', appreciation: 'Très Faible' },
    // En dessous de 7, la MGP est nulle
    { id: '11', min: 0, max: 6.99, gpa: 0.0, grade: 'F', appreciation: 'Nul' },
];

export const GradeContext = createContext<GradeContextType>({} as GradeContextType);

export const GradeProvider = ({ children }: { children: ReactNode }) => {
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [intervalles, setIntervalles] = useState<Intervalle[]>([]);
    const [notes, setNotes] = useState<Notes>({});
    const [systeme, setSysteme] = useState<Systeme>(20);
    const [pret, setPret] = useState(false);

    // Chargement initial des données depuis le stockage local
    useEffect(() => {
        chargerDonnees();
    }, []);

    const chargerDonnees = async () => {
        try {
            const [savedMatieres, savedIntervalles, savedNotes, savedSysteme] = await Promise.all([
                AsyncStorage.getItem('@matieres'),
                AsyncStorage.getItem('@intervalles'),
                AsyncStorage.getItem('@notes'),
                AsyncStorage.getItem('@systeme'),
            ]);

            // Si des données existent, on les utilise, sinon on charge les valeurs par défaut
            setMatieres(savedMatieres ? JSON.parse(savedMatieres) : MATIERES_DEFAULT);
            setIntervalles(savedIntervalles ? JSON.parse(savedIntervalles) : INTERVALLES_DEFAULT);
            setNotes(savedNotes ? JSON.parse(savedNotes) : {});
            setSysteme(savedSysteme === '100' ? 100 : 20);
        } catch (e) {
            console.error("Erreur de chargement des données :", e);
            setMatieres(MATIERES_DEFAULT);
            setIntervalles(INTERVALLES_DEFAULT);
        } finally {
            setPret(true);
        }
    };

    const enregistrer = async (cle: string, valeur: unknown) => {
        try {
            await AsyncStorage.setItem(cle, JSON.stringify(valeur));
        } catch (e) {
            console.error(`Erreur de sauvegarde (${cle}) :`, e);
        }
    };

    const sauvegarderMatieres = async (nouvellesMatieres: Matiere[]) => {
        setMatieres(nouvellesMatieres);
        await enregistrer('@matieres', nouvellesMatieres);

        // On retire les notes des matières supprimées
        const ids = new Set(nouvellesMatieres.map(m => m.id));
        const notesRestantes = Object.fromEntries(Object.entries(notes).filter(([id]) => ids.has(id)));
        if (Object.keys(notesRestantes).length !== Object.keys(notes).length) {
            await sauvegarderNotes(notesRestantes);
        }
    };

    const sauvegarderIntervalles = async (nouveauxIntervalles: Intervalle[]) => {
        setIntervalles(nouveauxIntervalles);
        await enregistrer('@intervalles', nouveauxIntervalles);
    };

    const sauvegarderNotes = async (nouvellesNotes: Notes) => {
        setNotes(nouvellesNotes);
        await enregistrer('@notes', nouvellesNotes);
    };

    // Change de système et convertit les notes déjà saisies (ex: 15/20 -> 75/100)
    const changerSysteme = async (nouveauSysteme: Systeme) => {
        if (nouveauSysteme === systeme) return;

        const facteur = nouveauSysteme / systeme;
        const notesConverties: Notes = {};
        Object.entries(notes).forEach(([id, texte]) => {
            const val = parseFloat(texte);
            if (!isNaN(val)) {
                notesConverties[id] = String(Math.round(val * facteur * 100) / 100);
            }
        });

        setSysteme(nouveauSysteme);
        await enregistrer('@systeme', nouveauSysteme);
        await sauvegarderNotes(notesConverties);
    };

    // On n'affiche rien tant que les données ne sont pas chargées :
    // sinon une modification faite pendant le chargement serait écrasée
    if (!pret) return null;

    return (
        <GradeContext.Provider value={{
            matieres,
            intervalles,
            notes,
            systeme,
            sauvegarderMatieres,
            sauvegarderIntervalles,
            sauvegarderNotes,
            changerSysteme
        }}>
            {children}
        </GradeContext.Provider>
    );
};
