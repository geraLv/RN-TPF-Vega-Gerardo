import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

export interface Note {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  date: string;
}

const STORAGE_KEY = '@photographic_notes_data';

export const NoteService = {
  async getNotes(): Promise<Note[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error reading notes:', e);
      return [];
    }
  },

  async saveNote(note: Omit<Note, 'id' | 'date'>): Promise<Note> {
    try {
      const notes = await this.getNotes();
      const newNote: Note = {
        ...note,
        id: uuidv4(),
        date: new Date().toISOString(),
      };
      const updatedNotes = [newNote, ...notes];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      return newNote;
    } catch (e) {
      console.error('Error saving note:', e);
      throw e;
    }
  },

  async updateNote(updatedNote: Note): Promise<void> {
    try {
      const notes = await this.getNotes();
      const newNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (e) {
      console.error('Error updating note:', e);
      throw e;
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const notes = await this.getNotes();
      const newNotes = notes.filter((n) => n.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    } catch (e) {
      console.error('Error deleting note:', e);
      throw e;
    }
  },
};
