import React from 'react';
import Task from '../Task';
import styles from './TaskList.module.scss';

interface TaskListProps {
    tasks: {
        id: number;
        title: string;
        description: string;
        completed: boolean;
        date: string;
    }[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
    if (tasks.length === 0) {
        return <p>No tasks for today!</p>;
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
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
};

export default TaskList;