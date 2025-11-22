import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Note, NoteService } from '../../services/NoteService';
import { Ionicons } from '@expo/vector-icons';

export default function NoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [note, setNote] = useState<Note | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadNote();
    }, [id]);

    const loadNote = async () => {
        if (!id) return;
        const notes = await NoteService.getNotes();
        const foundNote = notes.find((n) => n.id === id);
        if (foundNote) {
            setNote(foundNote);
        } else {
            Alert.alert('Error', 'Note not found', [{ text: 'OK', onPress: () => router.back() }]);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (note) {
                            await NoteService.deleteNote(note.id);
                            router.back();
                        }
                    },
                },
            ]
        );
    };

    if (!note) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Stack.Screen options={{
                headerRight: () => (
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={() => router.push(`/edit/${note.id}`)} style={styles.headerButton}>
                            <Ionicons name="create-outline" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                )
            }} />

            <Image source={{ uri: note.imageUri }} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.title}>{note.title}</Text>
                <Text style={styles.date}>{new Date(note.date).toLocaleString()}</Text>
                <Text style={styles.description}>{note.description}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: 16,
    },
});
