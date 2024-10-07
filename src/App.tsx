import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, differenceInCalendarDays, isBefore, isSameDay, addDays } from 'date-fns';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import Auth from './components/Auth';
import styles from './App.module.scss';

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    date: string;
    daysSpent: number;
    completionDate?: string | undefined; // добавляем дату завершения задачи
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Получаем дату последнего входа пользователя
    useEffect(() => {
        const updateLastOpened = async () => {
            if (user) {
                const lastOpenedDocRef = doc(db, 'users', user.uid);
                const lastOpenedDoc = await getDoc(lastOpenedDocRef);

                if (lastOpenedDoc.exists()) {
                    const lastOpenedData = lastOpenedDoc.data();
                    const lastOpenedDate = new Date(lastOpenedData?.lastOpened);

                    // Считаем количество дней с момента последнего входа
                    const daysSinceLastOpened = differenceInCalendarDays(new Date(), lastOpenedDate);

                    if (daysSinceLastOpened > 0) {
                        // Переносим все невыполненные задачи на количество дней вперёд
                        const updatedTasks = tasks.map((task) => {
                            if (!task.completed) {
                                const newDate = addDays(new Date(task.date), daysSinceLastOpened);
                                return {
                                    ...task,
                                    date: format(newDate, 'yyyy-MM-dd'),
                                };
                            }
                            return task;
                        });

                        // Обновляем задачи в Firestore
                        for (const task of updatedTasks) {
                            const taskDocRef = doc(db, 'tasks', task.id);
                            await updateDoc(taskDocRef, { date: task.date });
                        }

                        setTasks(updatedTasks);
                    }
                }

                // Обновляем дату последнего входа пользователя
                await updateDoc(lastOpenedDocRef, { lastOpened: new Date() });
            }
        };

        if (user) {
            updateLastOpened();
        }
    }, [user, tasks]);

    // Загружаем задачи пользователя
    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Task, 'id'>),
                }));
                setTasks(fetchedTasks);
            });

            return () => unsubscribe();
        }
    }, [user]);

    // Добавление новой задачи
    const handleAddTask = async () => {
        if (!title.trim()) {
            setError('Task title is required.');
            return;
        }

        if (!description.trim()) {
            setError('Task description is required.');
            return;
        }

        if (!selectedDate) {
            setError('Please select a date for the task.');
            return;
        }

        if (!user) {
            setError('User is not authenticated.');
            return;
        }

        const daysSpent = differenceInCalendarDays(new Date(), selectedDate);

        try {
            await addDoc(collection(db, 'tasks'), {
                title,
                description,
                completed: false,
                date: format(selectedDate, 'yyyy-MM-dd'),
                daysSpent: daysSpent < 0 ? 0 : daysSpent,
                userId: user.uid,
            });
            setTitle('');
            setDescription('');
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    // Завершение задачи
    const handleToggleTaskCompletion = async (id: string, completed: boolean, taskDate: string) => {
        try {
            const taskDocRef = doc(db, 'tasks', id);

            const today = new Date();
            const daysSpent = differenceInCalendarDays(today, new Date(taskDate));

            // Обновляем статус задачи в Firestore
            await updateDoc(taskDocRef, {
                completed: !completed,
                completionDate: !completed ? format(today, 'yyyy-MM-dd') : undefined,
                daysSpent: !completed ? daysSpent : 0,
            });

            // Обновляем задачи в локальном состоянии
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id
                        ? {
                              ...task,
                              completed: !completed,
                              daysSpent: !completed ? daysSpent : 0,
                              completionDate: !completed ? format(today, 'yyyy-MM-dd') : undefined,
                          }
                        : task
                )
            );
        } catch (err) {
            console.error('Error updating task: ', err);
        }
    };

    // Удаление задачи
    const handleDeleteTask = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', id));
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        } catch (err) {
            console.error('Error deleting task: ', err);
        }
    };

    // Вычисляем количество дней, затраченных на задачу
    const calculateDaysSpent = (taskDate: string, completionDate?: string) => {
        const taskDateParsed = new Date(taskDate);
        const endDate = completionDate ? new Date(completionDate) : new Date();

        if (isBefore(endDate, taskDateParsed) && !isSameDay(endDate, taskDateParsed)) {
            return 0;
        }

        return differenceInCalendarDays(endDate, taskDateParsed);
    };

    // Фильтруем задачи по выбранной дате
    const filteredTasks = tasks.filter((task) => {
        return selectedDate && task.date === format(selectedDate, 'yyyy-MM-dd');
    });

    if (!user) {
        return <Auth onLogin={setUser} />;
    }

    return (
        <div className={styles.app}>
            <h1>Task Tracker</h1>
            <button className={styles['logout-btn']} onClick={() => auth.signOut().then(() => setUser(null))}>
                Logout
            </button>

            <div className={styles['date-picker']}>
                <label>Select Date: </label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    placeholderText="Select a date"
                    minDate={new Date()}
                />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className={styles['task-form']}>
                <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>

            {selectedDate ? (
                <TaskList
                    tasks={filteredTasks.map((task) => ({
                        ...task,
                        daysSpent: calculateDaysSpent(task.date, task.completionDate),
                    }))}
                    onToggle={handleToggleTaskCompletion}
                    onDelete={handleDeleteTask}
                />
            ) : null}
        </div>
    );
};

export default App;
