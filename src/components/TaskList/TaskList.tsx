import React from 'react';
import Task from '../Task';
import styles from './TaskList.module.scss';

interface TaskListProps {
    tasks: {
        id: string;
        title: string;
        description: string;
        completed: boolean;
        date: string;
        daysSpent: number;
        completionDate?: string;
    }[];
    onToggle: (id: string, completed: boolean, taskDate: string) => void;
    onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
    if (tasks.length === 0) {
        return <p>No tasks for this day!</p>;
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
                    completionDate={task.completionDate}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
};

export default TaskList;
