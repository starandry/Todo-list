export const handleDeleteTask = async (id, setTasks) => {
    try {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
    } catch (err) {
        console.error('Error deleting task: ', err)
    }
}
