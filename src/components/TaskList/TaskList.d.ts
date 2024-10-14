import React from 'react'
interface TaskListProps {
    tasks: {
        id: string
        title: string
        description: string
        completed: boolean
        date: string
        daysSpent: number
        isFrozen: boolean
    }[]
    onToggle: (id: string, completed: boolean, date: string, isFrozen: boolean) => void
    onDelete: (id: string) => void
}
declare const TaskList: React.FC<TaskListProps>
export default TaskList
