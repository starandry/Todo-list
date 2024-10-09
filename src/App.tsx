import React, { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, differenceInCalendarDays, isBefore, isSameDay } from 'date-fns'
import { auth, db } from '../firebaseConfig'
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import Auth from './components/Auth'
import styles from './App.module.scss'

interface Task {
    id: string
    title: string
    description: string
    completed: boolean
    date: string // Оригинальная дата создания
    displayDate: string // Дата для отображения
    daysSpent: number
    lastCompletionDate: string | null // Дата последнего завершения задачи
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

                        // Обновляем displayDate только для незавершённых и просроченных задач
                        if (!task.completed && isBefore(taskDateParsed, new Date())) {
                            const calcDaysElapsed = differenceInCalendarDays(today, taskDateParsed)

                            await updateDoc(doc(db, 'tasks', task.id), {
                                displayDate: today,
                                daysSpent: calcDaysElapsed,
                            })
                            return { ...task, displayDate: today, daysSpent: calcDaysElapsed }
                        }

                        // Для завершённых задач displayDate оставляем как date
                        if (task.completed) {
                            return { ...task, displayDate: task.date }
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

        if (differenceInCalendarDays(selectedDate, new Date()) < 0) {
            setError('The date cannot be earlier than today. Please select a valid date.')
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
                date: format(selectedDate, 'yyyy-MM-dd'), // Сохраняем оригинальную дату создания
                displayDate: format(selectedDate, 'yyyy-MM-dd'), // Для будущих дат displayDate = date
                daysSpent: daysSpent < 0 ? 0 : daysSpent,
                lastCompletionDate: null, // Изначально задачи не завершались
                userId: user.uid,
            })
            setTitle('')
            setDescription('')
            setError(null)
        } catch (err) {
            setError((err as Error).message)
        }
    }

    const handleToggleTaskCompletion = async (
        id: string,
        completed: boolean,
        taskDate: string,
        currentDaysSpent: number,
        lastCompletionDate: string | null
    ) => {
        try {
            const taskDocRef = doc(db, 'tasks', id)

            // Если задача НЕ завершена и пользователь завершает её
            if (!completed) {
                const daysSpent = lastCompletionDate
                    ? differenceInCalendarDays(new Date(), new Date(lastCompletionDate)) + currentDaysSpent // Считаем дни с последнего завершения
                    : differenceInCalendarDays(new Date(), new Date(taskDate)) + currentDaysSpent // Если задача ни разу не завершалась

                // Обновляем статус задачи, замораживаем потраченные дни и записываем дату завершения
                await updateDoc(taskDocRef, {
                    completed: true,
                    daysSpent, // Замораживаем потраченные дни
                    lastCompletionDate: format(new Date(), 'yyyy-MM-dd'), // Сохраняем дату завершения
                })

                // Обновляем состояние с новыми данными
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id
                            ? {
                                  ...task,
                                  completed: true,
                                  daysSpent,
                                  lastCompletionDate: format(new Date(), 'yyyy-MM-dd'), // Сохраняем дату завершения
                              }
                            : task
                    )
                )
            } else {
                // Если задача УЖЕ завершена, но пользователь снова открывает её для выполнения
                const newTaskDate = lastCompletionDate || taskDate // Используем дату последнего завершения или создания задачи
                const updatedDaysSpent = differenceInCalendarDays(new Date(), new Date(newTaskDate)) // Начинаем счёт с последней даты

                await updateDoc(taskDocRef, {
                    completed: false,
                    daysSpent: updatedDaysSpent, // Считаем дни с последней завершённой даты
                    lastCompletionDate: null, // Сбрасываем дату последнего завершения
                })

                // Обновляем локальное состояние задач
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id
                            ? {
                                  ...task,
                                  completed: false,
                                  daysSpent: updatedDaysSpent,
                                  lastCompletionDate: null, // Очищаем дату последнего завершения
                              }
                            : task
                    )
                )
            }
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

    const calculateDaysSpent = (taskDate: string, lastCompletionDate: string | null) => {
        const referenceDate = lastCompletionDate ? new Date(lastCompletionDate) : new Date(taskDate)

        if (isBefore(new Date(), referenceDate) && !isSameDay(new Date(), referenceDate)) {
            return 0
        }

        return differenceInCalendarDays(new Date(), referenceDate)
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
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    isClearable
                    placeholderText="Select a date"
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
                        daysSpent: calculateDaysSpent(task.date, task.lastCompletionDate),
                    }))}
                    onToggle={(id, completed, date, daysSpent, lastCompletionDate) =>
                        handleToggleTaskCompletion(id, completed, date, daysSpent, lastCompletionDate)
                    }
                    onDelete={handleDeleteTask}
                />
            ) : null}
        </div>
    )
}

export default App
