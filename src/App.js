import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, differenceInCalendarDays, isBefore } from 'date-fns'
import { auth, db } from '../firebaseConfig'
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ru } from 'date-fns/locale'
import Auth from './components/Auth'
import styles from './App.module.scss'
registerLocale('ru', ru)
const App = () => {
    const [tasks, setTasks] = useState([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const today = format(new Date(), 'yyyy-MM-dd')
    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const fetchedTasks = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
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
            setError(err.message)
        }
    }
    const handleToggleTaskCompletion = async (id, completed, date) => {
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
    const handleDeleteTask = async (id) => {
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
        return _jsx(Auth, { onLogin: setUser })
    }
    return _jsxs('div', {
        className: styles.app,
        children: [
            _jsx('h1', { children: 'Task Tracker' }),
            _jsx('button', {
                className: styles['logout-btn'],
                onClick: () => auth.signOut().then(() => setUser(null)),
                children: 'Logout',
            }),
            _jsxs('div', {
                className: styles['date-picker'],
                children: [
                    _jsx('label', { children: 'Select Date: ' }),
                    _jsx(DatePicker, {
                        selected: selectedDate,
                        onChange: (date) => setSelectedDate(date),
                        dateFormat: 'yyyy-MM-dd',
                        isClearable: true,
                        placeholderText: '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443',
                        locale: 'ru',
                    }),
                ],
            }),
            error && _jsx('p', { style: { color: 'red' }, children: error }),
            _jsxs('div', {
                className: styles['task-form'],
                children: [
                    _jsx('input', {
                        type: 'text',
                        placeholder: 'Task Title',
                        value: title,
                        onChange: (e) => setTitle(e.target.value),
                    }),
                    _jsx('textarea', {
                        placeholder: 'Task Description',
                        value: description,
                        onChange: (e) => setDescription(e.target.value),
                    }),
                    _jsx('button', { onClick: handleAddTask, children: 'Add Task' }),
                ],
            }),
            selectedDate
                ? _jsx(TaskList, {
                      tasks: filteredTasks,
                      onToggle: (id, completed, date) => handleToggleTaskCompletion(id, completed, date),
                      onDelete: handleDeleteTask,
                  })
                : null,
        ],
    })
}
export default App
