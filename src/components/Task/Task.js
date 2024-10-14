import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import styles from './Task.module.scss'
const Task = ({ id, title, description, completed, date, daysSpent, isFrozen, onToggle, onDelete }) => {
    return _jsxs('div', {
        className: `${styles.task} ${completed ? styles.completed : ''}`,
        children: [
            _jsx('h3', { children: title }),
            _jsx('p', { children: description }),
            _jsxs('p', { className: styles.date, children: ['Created on: ', date] }),
            _jsxs('p', { className: styles.daysSpent, children: ['Days spent on this task: ', daysSpent] }),
            ' ',
            _jsxs('div', {
                className: styles.actions,
                children: [
                    _jsx('button', {
                        onClick: () => onToggle(id, completed, date, isFrozen),
                        children: completed ? 'Undo' : 'Complete',
                    }),
                    _jsx('button', { onClick: () => onDelete(id), children: 'Delete' }),
                ],
            }),
        ],
    })
}
export default Task
