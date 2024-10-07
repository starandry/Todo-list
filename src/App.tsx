import React, { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, differenceInCalendarDays, isBefore, isSameDay } from 'date-fns'
import { auth, db } from '../firebaseConfig'
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore' // Импортируем updateDoc для обновления задач
import { User } from 'firebase/auth'
import Auth from './components/Auth'
import styles from './App.module.scss'

interface Task {
    id: string
    title: string
    description: string
    completed: boolean
    date: string
    daysSpent: number
    frozenDays?: number
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Task, 'id'>),
                }))
                setTasks(fetchedTasks)
            })

            return () => unsubscribe()
        }
    }, [user])

    const handleAddTask = async () => {
        // Валидация полей
        if (!title.trim()) {
            setError('Task title is required.')
            return
        }

        if (!description.trim()) {
            setError('Task description is required.')
            return
        }

        if (!selectedDate) {
            setError('Please select a date for the task.')
            return
        }

        if (!user) {
            setError('User is not authenticated.')
            return
        }

        const daysSpent = differenceInCalendarDays(new Date(), selectedDate)

        try {
            await addDoc(collection(db, 'tasks'), {
                title,
                description,
                completed: false,
                date: format(selectedDate, 'yyyy-MM-dd'),
                daysSpent: daysSpent < 0 ? 0 : daysSpent,
                userId: user.uid,
            })
            setTitle('')
            setDescription('')
            setError(null)
        } catch (err) {
            setError((err as Error).message)
        }
    }

    const handleToggleTaskCompletion = async (id: string, completed: boolean) => {
        try {
            const taskDocRef = doc(db, 'tasks', id)

            // Обновляем статус задачи в Firestore
            await updateDoc(taskDocRef, {
                completed: !completed,
            })

            // Получаем обновленный статус задачи из Firestore
            const updatedTaskSnapshot = await getDoc(taskDocRef)
            const updatedTaskData = updatedTaskSnapshot.data()

            // Обновляем локальное состояние задач с новыми данными
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id
                        ? {
                              ...task,
                              completed: updatedTaskData?.completed,
                          }
                        : task
                )
            )
        } catch (err) {
            console.error('Error updating task: ', err)
        }
    }

    const handleDeleteTask = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', id))
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
        } catch (err) {
            console.error('Error deleting task: ', err)
        }
    }

    const calculateDaysSpent = (taskDate: string) => {
        const taskDateParsed = new Date(taskDate)
        const today = new Date()

        if (isBefore(today, taskDateParsed) && !isSameDay(today, taskDateParsed)) {
            return 0
        }

        return differenceInCalendarDays(today, taskDateParsed)
    }

    // Фильтруем задачи по выбранной дате
    const filteredTasks = tasks.filter((task) => {
        return selectedDate && task.date === format(selectedDate, 'yyyy-MM-dd')
    })

    if (!user) {
        return <Auth onLogin={setUser} />
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
                />
            </div>

            {error && (
                <p
                    style={{
                        color: 'red',
                    }}
                >
                    {error}
                </p>
            )}

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
                        daysSpent: calculateDaysSpent(task.date),
                    }))}
                    onToggle={(id, completed) => handleToggleTaskCompletion(id, completed)}
                    onDelete={handleDeleteTask}
                />
            ) : null}
        </div>
    )
}

export default App
