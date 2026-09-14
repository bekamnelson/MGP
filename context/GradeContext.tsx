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
}

interface GradeContextType {
    matieres: Matiere[];
    intervalles: Intervalle[];
    sauvegarderMatieres: (nouvellesMatieres: Matiere[]) => Promise<void>;
    sauvegarderIntervalles: (nouveauxIntervalles: Intervalle[]) => Promise<void>;
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
const INTERVALLES_DEFAULT: Intervalle[] = [
    { id: '1', min: 16, max: 20, gpa: 4.0 },
    { id: '2', min: 15, max: 15.99, gpa: 3.7 },
    { id: '3', min: 14, max: 14.99, gpa: 3.3 },
    { id: '4', min: 13, max: 13.99, gpa: 3.0 },
    { id: '5', min: 12, max: 12.99, gpa: 2.7 },
    { id: '6', min: 11, max: 11.99, gpa: 2.3 },
    { id: '7', min: 10, max: 10.99, gpa: 2.0 },
    { id: '8', min: 9, max: 9.99, gpa: 1.7 },
    { id: '9', min: 8, max: 8.99, gpa: 1.3 },
    { id: '10', min: 7, max: 7.99, gpa: 1.0 },
    { id: '11', min: 0, max: 6.99, gpa: 0.0 },
];

export const GradeContext = createContext<GradeContextType>({} as GradeContextType);

export const GradeProvider = ({ children }: { children: ReactNode }) => {
    const [matieres, setMatieres] = useState<Matiere[]>([]);
    const [intervalles, setIntervalles] = useState<Intervalle[]>([]);

    // Chargement initial des données depuis le stockage local
    useEffect(() => {
        chargerDonnees();
    }, []);

    const chargerDonnees = async () => {
        try {
            const savedMatieres = await AsyncStorage.getItem('@matieres');
            const savedIntervalles = await AsyncStorage.getItem('@intervalles');

            // Si des données existent, on les utilise, sinon on charge les valeurs par défaut
            setMatieres(savedMatieres ? JSON.parse(savedMatieres) : MATIERES_DEFAULT);
            setIntervalles(savedIntervalles ? JSON.parse(savedIntervalles) : INTERVALLES_DEFAULT);
        } catch (e) {
            console.error("Erreur de chargement des données :", e);
        }
    };

    const sauvegarderMatieres = async (nouvellesMatieres: Matiere[]) => {
        setMatieres(nouvellesMatieres);
        await AsyncStorage.setItem('@matieres', JSON.stringify(nouvellesMatieres));
    };

    const sauvegarderIntervalles = async (nouveauxIntervalles: Intervalle[]) => {
        setIntervalles(nouveauxIntervalles);
        await AsyncStorage.setItem('@intervalles', JSON.stringify(nouveauxIntervalles));
    };

    return (
        <GradeContext.Provider value={{
            matieres,
            intervalles,
            sauvegarderMatieres,
            sauvegarderIntervalles
        }}>
            {children}
        </GradeContext.Provider>
    );
};