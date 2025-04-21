import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Switch, SafeAreaView } from 'react-native';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get<Task[]>('https://your-api-url/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const addTask = async () => {
    try {
      const res = await axios.post<Task>('https://your-api-url/tasks/', { title: task });
      setTasks(prev => [...prev, res.data]);
      setTask('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.dark]}>
      <Text style={[styles.title, darkMode && styles.textLight]}>To-Do List</Text>

      <View style={styles.switchContainer}>
        <Text style={[styles.textLabel, darkMode && styles.textLight]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <TextInput
        style={[styles.input, darkMode && styles.inputDark]}
        placeholder="Enter task..."
        placeholderTextColor={darkMode ? '#aaa' : '#555'}
        onChangeText={setTask}
        value={task}
      />
      <Button title="Add Task" onPress={addTask} />

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Text style={[styles.item, darkMode && styles.textLight]}>{item.title}</Text>
        )}
        keyExtractor={item => item.id.toString()}
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
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  textLabel: {
    fontSize: 16,
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
    padding: 10,
    fontSize: 18,
  },
  textLight: {
    color: '#fff',
  },
});
