import React from 'react';
import styles from './Task.module.scss';

interface TaskProps {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    date: string;
    daysSpent: number;
    completionDate?: string; // добавляем поле для даты завершения
    onToggle: (id: string, completed: boolean, taskDate: string) => void;
    onDelete: (id: string) => void;
}

const Task: React.FC<TaskProps> = ({
    id,
    title,
    description,
    completed,
    date,
    daysSpent,
    completionDate,
    onToggle,
    onDelete,
}) => {
    return (
        <div className={`${styles.task} ${completed ? styles.completed : ''}`}>
            <h3>{title}</h3>
            <p>{description}</p>
            <p className={styles.date}>Created on: {date}</p>
            {completed && completionDate && <p className={styles.completionDate}>Completed on: {completionDate}</p>}
            <p className={styles.daysSpent}>Days spent on this task: {daysSpent}</p>
            <div className={styles.actions}>
                <button onClick={() => onToggle(id, completed, date)}>{completed ? 'Undo' : 'Complete'}</button>
                <button onClick={() => onDelete(id)}>Delete</button>
            </div>
        </div>
    );
};

export default Task;
