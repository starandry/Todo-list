import React, { useState } from 'react';
import TaskList from './components/TaskList';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from "date-fns/locale/ru";
import 'react-datepicker/dist/react-datepicker.css';
import { format, differenceInCalendarDays } from 'date-fns';
import styles from './App.module.scss';

interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    date: string;
    daysSpent: number;
    frozenDays?: number;
}

registerLocale('ru', ru);

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [error, setError] = useState<string | null>(null);

    const formatDate = (date: Date | null): string => {
        return date ? format(date, 'yyyy-MM-dd') : '';
    };

    const calculateDaysSpent = (taskDate: Date): number => {
        const today = new Date();
        return differenceInCalendarDays(today, taskDate);
    };

    const addTask = () => {
        if (!selectedDate) {
            setError('Please select a date for the task.');
            return;
        }
        
        const taskDate = selectedDate;

        const daysSpent = calculateDaysSpent(taskDate);

        if (title.trim()) {
            const newTask: Task = {
                id: tasks.length + 1,
                title,
                description,
                completed: false,
                date: formatDate(taskDate),
                daysSpent: daysSpent >= 0 ? daysSpent : 0,
            };
            setTasks([...tasks, newTask]);
            setTitle('');
            setDescription('');
            setError(null);
        }
    };

    const toggleTaskCompletion = (taskId: number) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                if (task.id === taskId) {
                    if (task.completed) {
                        return { ...task, completed: false, frozenDays: undefined };
                    } else {
                        return { ...task, completed: true, frozenDays: task.daysSpent };
                    }
                }

                if (!task.completed) {
                    const taskDate = new Date(task.date);
                    const updatedDaysSpent = calculateDaysSpent(taskDate);
                    return { ...task, daysSpent: updatedDaysSpent };
                }

                return task;
            })
        );
    };

    const deleteTask = (taskId: number) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    };

    const filteredTasks = selectedDate
        ? tasks.filter((task) => task.date === formatDate(selectedDate))
        : [];

    return (
        <div className={styles.app}>
            <h1>Task Tracker</h1>

            <div className={styles['date-picker']}>
                <label>Select Date: </label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd-MM-yyyy"
                    isClearable
                    placeholderText="Выберите дату"
                    locale="ru"
                />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

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

            {selectedDate ? (
                filteredTasks.length > 0 ? (
                    <TaskList
                        tasks={filteredTasks.map(task => ({
                            ...task,
                            daysSpent: task.completed ? task.frozenDays || task.daysSpent : task.daysSpent
                        }))}
                        onToggle={toggleTaskCompletion}
                        onDelete={deleteTask}
                    />
                ) : (
                    <p>No tasks for this date!</p>
                )
            ) : null}
        </div>
    );
};

export default App;
