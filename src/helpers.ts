export const handleAddTask = (
    title: string,
    description: string,
    selectedDate: Date | null,
    user: { uid: string } | null,
    setError: (message: string) => void
) => {
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
