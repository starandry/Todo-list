import React from 'react';
import styles from './Task.module.scss';

interface TaskProps {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const Task: React.FC<TaskProps> = ({ id, title, description, completed, onToggle, onDelete }) => {
    return (
        <div className={`${styles.task} ${completed ? styles.completed : ''}`}>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className={styles.actions}>
                <button onClick={() => onToggle(id)}>
                    {completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => onDelete(id)}>Delete</button>
            </div>
        </div>
    );
};

export default Task;