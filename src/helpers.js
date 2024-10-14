export const handleAddTask = (title, description, selectedDate, user, setError) => {
    if (!title.trim()) {
        setError('Task title is required.')
        return
    }
    if (!description.trim()) {
        setError('Task description is required.')
        return
    }
    if (!selectedDate) {
        setError('Please select a date for the task.')
        return
    }
    if (!user) {
        setError('User is not authenticated.')
        return
    }
}
