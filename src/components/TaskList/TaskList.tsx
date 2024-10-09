import React from 'react'
import Task from '../Task'
import styles from './TaskList.module.scss'

interface TaskListProps {
    tasks: {
        id: string
        title: string
        description: string
        completed: boolean
        date: string
        daysSpent: number
        isFrozen: boolean // Флаг для заморозки
    }[]
    onToggle: (id: string, completed: boolean, date: string, isFrozen: boolean) => void
    onDelete: (id: string) => void
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
    if (tasks.length === 0) {
        return <p>No tasks for today!</p>
    }

    return (
        <ul className={styles['task-list']}>
            {tasks.map((task) => (
                <Task
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    completed={task.completed}
                    date={task.date}
                    daysSpent={task.daysSpent}
                    isFrozen={task.isFrozen} // Передаём флаг заморозки
                    onToggle={() => onToggle(task.id, task.completed, task.date, task.isFrozen)} // Передаём isFrozen
                    onDelete={() => onDelete(task.id)}
                />
            ))}
        </ul>
    )
}

export default TaskList
