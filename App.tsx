import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, Switch, SafeAreaView, TouchableOpacity
} from 'react-native';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const API_URL = 'http://192.168.1.34:8000'; // replace with your actual IP

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      let url = `${API_URL}/tasks/`;
      if (filter !== 'all') url += `?status=${filter}`;
      const res = await axios.get<Task[]>(url);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const addOrUpdateTask = async () => {
    try {
      if (editId !== null) {
        const res = await axios.put<Task>(`${API_URL}/tasks/${editId}`, {
          title: task,
          completed: false,
        });
        setTasks(prev => prev.map(t => (t.id === res.data.id ? res.data : t)));
        setEditId(null);
      } else {
        const res = await axios.post<Task>(`${API_URL}/tasks/`, { title: task });
        setTasks(prev => [...prev, res.data]);
      }
      setTask('');
    } catch (err) {
      console.error('Error adding/updating task:', err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const res = await axios.put<Task>(`${API_URL}/tasks/${task.id}`, {
        title: task.title,
        completed: !task.completed,
      });
      setTasks(prev => prev.map(t => (t.id === res.data.id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling completion:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.dark]}>
      <Text style={[styles.title, darkMode && styles.textLight]}>To-Do List</Text>

      <View style={styles.switchContainer}>
        <Text style={[styles.textLabel, darkMode && styles.textLight]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <View style={styles.filterContainer}>
        {['all', 'completed', 'pending'].map(f => (
          <Button
            key={f}
            title={f}
            color={filter === f ? 'blue' : 'gray'}
            onPress={() => setFilter(f as any)}
          />
        ))}
      </View>

      <TextInput
        style={[styles.input, darkMode && styles.inputDark]}
        placeholder="Enter task..."
        placeholderTextColor={darkMode ? '#aaa' : '#555'}
        onChangeText={setTask}
        value={task}
      />

      <Button
        title={editId !== null ? 'Update Task' : 'Add Task'}
        onPress={addOrUpdateTask}
      />

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleComplete(item)}>
              <Text style={[
                styles.item,
                darkMode && styles.textLight,
                item.completed && styles.completed
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => {
                setTask(item.title);
                setEditId(item.id);
              }} />
              <Button title="Delete" color="red" onPress={() => deleteTask(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
    backgroundColor: '#fff',
  },
  dark: {
    backgroundColor: '#111',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textLabel: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    color: '#fff',
  },
  item: {
    fontSize: 18,
    paddingVertical: 5,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  textLight: {
    color: '#fff',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingVertical: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 5,
  },
});
