import React, { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, differenceInCalendarDays, isBefore } from 'date-fns'
import { auth, db } from '../firebaseConfig'
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { ru } from 'date-fns/locale'
import Auth from './components/Auth'
import styles from './App.module.scss'

registerLocale('ru', ru)

interface Task {
    id: string
    title: string
    description: string
    completed: boolean
    date: string
    displayDate: string
    daysSpent: number
    isFrozen: boolean
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    const today = format(new Date(), 'yyyy-MM-dd')

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Task, 'id'>),
                }))

                const updatedTasks = await Promise.all(
                    fetchedTasks.map(async (task) => {
                        const taskDateParsed = new Date(task.date)

                        if (!task.completed && !task.isFrozen && isBefore(taskDateParsed, new Date())) {
                            const calcDaysElapsed = differenceInCalendarDays(today, taskDateParsed)

                            await updateDoc(doc(db, 'tasks', task.id), {
                                displayDate: today,
                                daysSpent: calcDaysElapsed,
                            })
                            return { ...task, displayDate: today, daysSpent: calcDaysElapsed }
                        }

                        return task
                    })
                )

                setTasks(updatedTasks)
            })

            return () => unsubscribe()
        }
    }, [user])

    const handleAddTask = async () => {
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

        if (isBefore(selectedDate, today)) {
            setError('Cannot select past date. Please choose correct date.')
            return
        }

        if (!user) {
            setError('User is not authenticated.')
            return
        }

        const daysSpent = isBefore(new Date(), selectedDate) ? 0 : differenceInCalendarDays(new Date(), selectedDate)

        try {
            await addDoc(collection(db, 'tasks'), {
                title,
                description,
                completed: false,
                date: format(selectedDate, 'yyyy-MM-dd'),
                displayDate: format(selectedDate, 'yyyy-MM-dd'),
                daysSpent,
                isFrozen: false,
                userId: user.uid,
            })
            setTitle('')
            setDescription('')
            setError(null)
        } catch (err) {
            setError((err as Error).message)
        }
    }

    const handleToggleTaskCompletion = async (id: string, completed: boolean, date: string) => {
        try {
            const taskDocRef = doc(db, 'tasks', id)
            let updatedDaysSpent = differenceInCalendarDays(new Date(), new Date(date))

            if (!completed) {
                const currentDaysSpent = differenceInCalendarDays(new Date(), new Date(date))
                await updateDoc(taskDocRef, {
                    completed: true,
                    daysSpent: currentDaysSpent,
                    isFrozen: true,
                })
            } else {
                await updateDoc(taskDocRef, {
                    completed: false,
                    isFrozen: false,
                })
                updatedDaysSpent = differenceInCalendarDays(new Date(), new Date(date))
            }

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id
                        ? {
                              ...task,
                              completed: !completed,
                              daysSpent: updatedDaysSpent,
                              isFrozen: !completed,
                          }
                        : task
                )
            )
        } catch (err) {
            console.error('Ошибка при обновлении задачи: ', err)
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
    const filteredTasks = tasks.filter((task) => {
        return selectedDate && task.displayDate === format(selectedDate, 'yyyy-MM-dd')
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
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    placeholderText="Выберите дату"
                    locale="ru"
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
                    tasks={filteredTasks}
                    onToggle={(id, completed, date) => handleToggleTaskCompletion(id, completed, date)}
                    onDelete={handleDeleteTask}
                />
            ) : null}
        </div>
    )
}

export default App
