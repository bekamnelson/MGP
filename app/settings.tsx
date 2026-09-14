import { Stack } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Alert,
    FlatList, SafeAreaView,
    StyleSheet, Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { GradeContext } from '../context/GradeContext';

// 1. IMPORTATION ADMOB
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


import { ENABLE_REAL_ADS } from "./(tabs)/index";

const REAL_BANNER_SETTINGS = 'ca-app-pub-5542646175321041/6963169563';


export const adUnitIdSettings = ENABLE_REAL_ADS ? REAL_BANNER_SETTINGS : TestIds.BANNER;

export default function SettingsScreen() {
    const { intervalles, sauvegarderIntervalles } = useContext(GradeContext);
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [gpa, setGpa] = useState('');

    const ajouterIntervalle = () => {
        const minVal = parseFloat(min.replace(',', '.'));
        const maxVal = parseFloat(max.replace(',', '.'));
        const gpaVal = parseFloat(gpa.replace(',', '.'));

        if (isNaN(minVal) || isNaN(maxVal) || isNaN(gpaVal)) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement.');
            return;
        }

        if (minVal < 0 || maxVal > 20 || minVal >= maxVal) {
            Alert.alert('Intervalle invalide', 'Vérifiez les notes minimale et maximale (0 à 20).');
            return;
        }

        if (gpaVal < 0 || gpaVal > 4) {
            Alert.alert('MGP invalide', 'La MGP doit être comprise entre 0.0 et 4.0.');
            return;
        }

        const chevauchement = intervalles.some(
            (i) => (minVal >= i.min && minVal < i.max) || (maxVal > i.min && maxVal <= i.max)
        );

        if (chevauchement) {
            Alert.alert('Chevauchement', 'Cette plage de notes existe déjà en partie.');
            return;
        }

        const nouveau = {
            id: Date.now().toString(),
            min: minVal,
            max: maxVal,
            gpa: gpaVal,
        };

        const misAJour = [...intervalles, nouveau].sort((a, b) => b.min - a.min);
        sauvegarderIntervalles(misAJour);

        setMin('');
        setMax('');
        setGpa('');
    };

    const supprimerIntervalle = (id: string) => {
        const misAJour = intervalles.filter((i) => i.id !== id);
        sauvegarderIntervalles(misAJour);
    };

    const reinitialiserBaremeParDefaut = () => {
        Alert.alert(
            'Réinitialiser',
            'Voulez-vous restaurer le barème standard ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Restaurer',
                    style: 'destructive',
                    onPress: () => {
                        const parDefaut = [
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
                        sauvegarderIntervalles(parDefaut);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Configuration du Barème' }} />

            {/* 3. ENVELOPPE DU CONTENU POUR SÉPARER DE LA PUB */}
            <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Barème MGP</Text>
                        <Text style={styles.subtitle}>Définissez la MGP pour chaque tranche de note.</Text>
                    </View>
                    <TouchableOpacity style={styles.btnReset} onPress={reinitialiserBaremeParDefaut}>
                        <Text style={styles.btnResetText}>🔄 Reset</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardForm}>
                    <View style={styles.inputsRow}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.fieldLabel}>Note Min</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: 12"
                                placeholderTextColor="#94a3b8"
                                keyboardType="decimal-pad"
                                value={min}
                                onChangeText={setMin}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.fieldLabel}>Note Max</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: 13.99"
                                placeholderTextColor="#94a3b8"
                                keyboardType="decimal-pad"
                                value={max}
                                onChangeText={setMax}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.fieldLabel}>MGP</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex: 3.0"
                                placeholderTextColor="#94a3b8"
                                keyboardType="decimal-pad"
                                value={gpa}
                                onChangeText={setGpa}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.btnAdd} onPress={ajouterIntervalle}>
                        <Text style={styles.btnAddText}>+ Ajouter la tranche</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={intervalles}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.rowText}>Note de {item.min} à {item.max}</Text>
                            <Text style={styles.gpaText}>{item.gpa.toFixed(1)} MGP</Text>
                            <TouchableOpacity onPress={() => supprimerIntervalle(item.id)}>
                                <Text style={styles.deleteText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {/* 4. CONTENEUR DE LA PUBLICITÉ SÉCURISÉ EN BAS */}
            <View style={styles.adContainer}>
                <BannerAd
                    unitId={adUnitIdSettings}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },

    // J'ai déplacé le padding ici pour que la pub prenne toute la largeur en bas
    contentWrapper: { flex: 1, padding: 15 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 12, color: '#64748b' },
    btnReset: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    btnResetText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },

    cardForm: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 15, elevation: 1 },
    inputsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    inputContainer: { flex: 1 },
    fieldLabel: { fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 4 },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 44,
        fontSize: 14,
        textAlign: 'center',
        color: '#0f172a'
    },
    btnAdd: { backgroundColor: '#3b82f6', height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    btnAddText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

    row: { backgroundColor: '#fff', padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rowText: { fontSize: 14, color: '#334155' },
    gpaText: { fontWeight: 'bold', color: '#3b82f6', fontSize: 15 },
    deleteText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, paddingHorizontal: 8 },

    // STYLES SÉCURISÉS POUR ADMOB
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        paddingTop: 10,
        paddingBottom: 10, // Marge de sécurité en bas
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    }
});