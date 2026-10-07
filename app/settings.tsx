import { Stack } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet, Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradeContext, INTERVALLES_DEFAULT } from '../context/GradeContext';

// 1. IMPORTATION ADMOB
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, etatPubs, usePubsAutorisees } from '../utils/ads';

export default function SettingsScreen() {
    const { intervalles, sauvegarderIntervalles } = useContext(GradeContext);
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [gpa, setGpa] = useState('');
    const [grade, setGrade] = useState('');
    const pubsAutorisees = usePubsAutorisees();

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

        // Deux tranches se chevauchent dès qu'elles ont une note en commun
        // (y compris quand la nouvelle englobe entièrement une tranche existante)
        const chevauchement = intervalles.some(
            (i) => minVal <= i.max && maxVal >= i.min
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
            grade: grade.trim().toUpperCase() || undefined,
        };

        const misAJour = [...intervalles, nouveau].sort((a, b) => b.min - a.min);
        sauvegarderIntervalles(misAJour);

        setMin('');
        setMax('');
        setGpa('');
        setGrade('');
    };

    const supprimerIntervalle = (intervalle: { id: string; min: number; max: number }) => {
        Alert.alert(
            'Confirmation',
            `Voulez-vous supprimer la tranche ${intervalle.min} à ${intervalle.max} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        const misAJour = intervalles.filter((i) => i.id !== intervalle.id);
                        sauvegarderIntervalles(misAJour);
                    },
                },
            ]
        );
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
                        sauvegarderIntervalles(INTERVALLES_DEFAULT);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <Stack.Screen options={{ title: 'Configuration du Barème' }} />

            {/* 3. ENVELOPPE DU CONTENU POUR SÉPARER DE LA PUB */}
            <View style={styles.contentWrapper}>
                <FlatList
                    data={intervalles}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.liste}
                    // L'en-tête défile avec la liste : l'écran reste utilisable en paysage
                    ListHeaderComponent={
                        <>
                            <View style={styles.headerRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>Barème MGP</Text>
                                    <Text style={styles.subtitle}>Définissez la MGP pour chaque tranche de note (notes sur 20).</Text>
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

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.fieldLabel}>Grade</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="ex: B+"
                                            placeholderTextColor="#94a3b8"
                                            autoCapitalize="characters"
                                            maxLength={3}
                                            value={grade}
                                            onChangeText={setGrade}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.btnAdd} onPress={ajouterIntervalle}>
                                    <Text style={styles.btnAddText}>+ Ajouter la tranche</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.gradeText}>{item.grade ?? '-'}</Text>
                            <Text style={styles.rowText}>Note de {item.min} à {item.max}</Text>
                            <Text style={styles.gpaText}>{item.gpa.toFixed(1)} MGP</Text>
                            <TouchableOpacity onPress={() => supprimerIntervalle(item)}>
                                <Text style={styles.deleteText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {/* 4. CONTENEUR DE LA PUBLICITÉ SÉCURISÉ EN BAS */}
            {pubsAutorisees && (
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={AD_UNIT_IDS.banniereBareme}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                        onAdOpened={() => { etatPubs.ignorerProchainRetour = true; }}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },

    // J'ai déplacé le padding ici pour que la pub prenne toute la largeur en bas
    contentWrapper: { flex: 1 },
    // Sur tablette, le contenu reste centré au lieu de s'étirer sur toute la largeur
    liste: { padding: 15, width: '100%', maxWidth: 720, alignSelf: 'center' },

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
    rowText: { flex: 1, fontSize: 14, color: '#334155' },
    gradeText: { width: 36, fontWeight: 'bold', color: '#0f172a', fontSize: 15 },
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