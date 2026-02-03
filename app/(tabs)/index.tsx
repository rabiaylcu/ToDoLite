import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = '@todolite:todos';

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      setTodos(newTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = () => {
    if (inputText.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen bir görev girin');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
    };

    const newTodos = [...todos, newTodo];
    saveTodos(newTodos);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const newTodos = todos.filter((todo) => todo.id !== id);
            saveTodos(newTodos);
          },
        },
      ]
    );
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <ThemedView style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodo(item.id)}
        activeOpacity={0.7}>
        <ThemedView
          style={[
            styles.checkbox,
            item.completed && styles.checkboxCompleted,
            isDark && item.completed && styles.checkboxCompletedDark,
          ]}>
          {item.completed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </ThemedView>
        <ThemedText
          style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
          {item.text}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
        activeOpacity={0.7}>
        <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          ToDo Lite
        </ThemedText>
        {totalCount > 0 && (
          <ThemedText style={styles.stats}>
            {completedCount} / {totalCount} tamamlandı
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
          ]}
          placeholder="Yeni görev ekle..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity
          style={[styles.addButton, isDark && styles.addButtonDark]}
          onPress={addTodo}
          activeOpacity={0.7}>
          <ThemedText style={styles.addButtonText}>+</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {todos.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Henüz görev yok</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Yukarıdaki alana görev ekleyerek başlayın
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDark: {
    backgroundColor: '#0A84FF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  checkboxCompletedDark: {
    backgroundColor: '#0A84FF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
});
