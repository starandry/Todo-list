export declare const handleAddTask: (
    title: string,
    description: string,
    selectedDate: Date | null,
    user: {
        uid: string
    } | null,
    setError: (message: string) => void
) => void
