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
    date: string // Оригинальная дата создания
    displayDate: string // Дата для отображения
    daysSpent: number
    isFrozen: boolean // Флаг для заморозки
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    const today = format(new Date(), 'yyyy-MM-dd')

    /* Подписка на изменения пользователя в БД */
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

                        // Если задача не завершена и её дата прошла, обновляем daysSpent
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

        // Валидация на прошедшую дату
        if (isBefore(selectedDate, today)) {
            setError('Cannot select past date. Please choose correct date.')
            return
        }

        if (!user) {
            setError('User is not authenticated.')
            return
        }

        // Если дата задачи в будущем, устанавливаем daysSpent = 0
        const daysSpent = isBefore(new Date(), selectedDate) ? 0 : differenceInCalendarDays(new Date(), selectedDate)

        try {
            await addDoc(collection(db, 'tasks'), {
                title,
                description,
                completed: false,
                date: format(selectedDate, 'yyyy-MM-dd'), // Сохраняем оригинальную дату создания
                displayDate: format(selectedDate, 'yyyy-MM-dd'), // Для будущих дат displayDate = date
                daysSpent,
                isFrozen: false, // Изначально задача не заморожена
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
                // Если задача завершается, замораживаем daysSpent
                const currentDaysSpent = differenceInCalendarDays(new Date(), new Date(date))
                await updateDoc(taskDocRef, {
                    completed: true,
                    daysSpent: currentDaysSpent,
                    isFrozen: true, // Замораживаем задачу
                })
            } else {
                // Если задача возвращается в незавершённое состояние, размораживаем daysSpent
                await updateDoc(taskDocRef, {
                    completed: false,
                    isFrozen: false, // Размораживаем задачу
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
                              isFrozen: !completed, // Замораживаем или размораживаем
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
    // Фильтруем задачи по выбранной дате с учетом displayDate
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
