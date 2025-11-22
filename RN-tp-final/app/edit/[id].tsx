import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Image, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Note, NoteService } from '../../services/NoteService';
import { Ionicons } from '@expo/vector-icons';

export default function EditScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [originalNote, setOriginalNote] = useState<Note | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadNote();
    }, [id]);

    const loadNote = async () => {
        if (!id) return;
        const notes = await NoteService.getNotes();
        const foundNote = notes.find((n) => n.id === id);
        if (foundNote) {
            setOriginalNote(foundNote);
            setTitle(foundNote.title);
            setDescription(foundNote.description);
            setImageUri(foundNote.imageUri);
        } else {
            Alert.alert('Error', 'Note not found', [{ text: 'OK', onPress: () => router.back() }]);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Camera permission is required to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title.');
            return;
        }
        if (!imageUri) {
            Alert.alert('Error', 'Please add an image.');
            return;
        }
        if (!originalNote) return;

        try {
            await NoteService.updateNote({
                ...originalNote,
                title,
                description,
                imageUri,
                date: new Date().toISOString(), // Update date on edit? Requirement says "creation/last modification", so yes.
            });
            router.dismissTo('/'); // Go back to home or detail? Requirement says "redirect to list" for create/delete, but for update "update list". Usually back to detail or list. Let's go to list to be safe or back to detail.
            // Actually requirement says: "Guardar los cambios en el AsyncStorage y actualizar la lista."
            // If I go back to detail, it will reload. If I go to list, it will reload.
            // Let's go back to the detail view, which will then show updated info.
            // Wait, if I go back to detail, I need to make sure detail reloads.
            // The detail screen uses `useEffect` on `id`. If I just `router.back()`, it might not trigger if it's just popping.
            // But `useFocusEffect` or reloading on focus would work.
            // However, `router.dismissTo('/')` is safe to go to list.
            // Let's try `router.push('/')` or `router.navigate('/')` to be sure, or just `router.back()` twice?
            // Let's stick to `router.push('/')` to match "redirect to main list" flow of others, although usually edit goes back to detail.
            // The requirement says "Guardar los cambios ... y actualizar la lista".
            // Let's go to home.
            router.dismissAll();
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', 'Failed to save note.');
        }
    };

    if (!originalNote) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={64} color="#ccc" />
                    </View>
                )}
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color="#007AFF" />
                    <Text style={styles.iconButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                    <Ionicons name="images" size={24} color="#007AFF" />
                    <Text style={styles.iconButtonText}>Gallery</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter note title"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter note description"
                multiline
                numberOfLines={4}
            />

            <Button title="Save Changes" onPress={handleSave} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#eef6ff',
        borderRadius: 8,
    },
    iconButtonText: {
        marginLeft: 8,
        color: '#007AFF',
        fontWeight: '600',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});
