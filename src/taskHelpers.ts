export const handleDeleteTask = async (id: string, setTasks: (updateFn: (prevTasks: any[]) => any[]) => void) => {
    try {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
    } catch (err) {
        console.error('Error deleting task: ', err)
    }
}
