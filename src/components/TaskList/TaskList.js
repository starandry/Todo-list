import { jsx as _jsx } from 'react/jsx-runtime'
import Task from '../Task'
import styles from './TaskList.module.scss'
const TaskList = ({ tasks, onToggle, onDelete }) => {
    if (tasks.length === 0) {
        return _jsx('p', { children: 'No tasks for today!' })
    }
    return _jsx('ul', {
        className: styles['task-list'],
        children: tasks.map((task) =>
            _jsx(
                Task,
                {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    date: task.date,
                    daysSpent: task.daysSpent,
                    isFrozen: task.isFrozen,
                    onToggle: () => onToggle(task.id, task.completed, task.date, task.isFrozen),
                    onDelete: () => onDelete(task.id),
                },
                task.id
            )
        ),
    })
}
export default TaskList
