import React, { useState } from 'react';
import TaskList from './components/TaskList';
import styles from './App.module.scss';

interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const addTask = () => {
        if (title.trim()) {
            const newTask: Task = {
                id: tasks.length + 1,
                title,
                description,
                completed: false,
            };
            setTasks([...tasks, newTask]);
            setTitle('');
            setDescription('');
        }
    };

    const toggleTaskCompletion = (taskId: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (taskId: number) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    };

    return (
        <div className={styles.app}>
            <h1>Task Tracker</h1>
            <div className={styles['task-form']}>
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button onClick={addTask}>Add Task</button>
            </div>
            <TaskList tasks={tasks} onToggle={toggleTaskCompletion} onDelete={deleteTask} />
        </div>
    );
};

export default App;