import { differenceInCalendarDays } from 'date-fns'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig' // Импортируйте db из вашей конфигурации Firestore

export const handleToggleTaskCompletion = async (
    id: string,
    completed: boolean,
    date: string,
    setTasks: (updateFn: (prevTasks: any[]) => any[]) => void
) => {
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

export const handleDeleteTask = async (id: string, setTasks: (updateFn: (prevTasks: any[]) => any[]) => void) => {
    try {
        // Исключаем Firestore, просто симулируем удаление
        // await deleteDoc(doc(db, 'tasks', id));

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
    } catch (err) {
        console.error('Error deleting task: ', err)
    }
}
