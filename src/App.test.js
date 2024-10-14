import { handleAddTask } from './helpers'
import { handleDeleteTask } from './taskHelpers'
describe('handleAddTask', () => {
    it('устанавливает ошибку, если заголовок пуст', () => {
        const setError = jest.fn()
        handleAddTask('', 'Some description', new Date(), { uid: '123' }, setError)
        expect(setError).toHaveBeenCalledWith('Task title is required.')
    })
    it('устанавливает ошибку, если описание пусто', () => {
        const setError = jest.fn()
        handleAddTask('Some title', '', new Date(), { uid: '123' }, setError)
        expect(setError).toHaveBeenCalledWith('Task description is required.')
    })
    it('устанавливает ошибку, если дата не выбрана', () => {
        const setError = jest.fn()
        handleAddTask('Some title', 'Some description', null, { uid: '123' }, setError)
        expect(setError).toHaveBeenCalledWith('Please select a date for the task.')
    })
    it('устанавливает ошибку, если пользователь не аутентифицирован', () => {
        const setError = jest.fn()
        handleAddTask('Some title', 'Some description', new Date(), null, setError)
        expect(setError).toHaveBeenCalledWith('User is not authenticated.')
    })
})
describe('handleDeleteTask', () => {
    const setTasks = jest.fn()
    const taskId = 'test-task-id'
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('удаляет задачу из списка задач', async () => {
        const prevTasks = [
            { id: 'task-1', title: 'Task 1' },
            { id: 'test-task-id', title: 'Task to be deleted' },
        ]
        await handleDeleteTask(taskId, setTasks)
        expect(setTasks).toHaveBeenCalledWith(expect.any(Function))
        const updateFn = setTasks.mock.calls[0][0]
        const updatedTasks = updateFn(prevTasks)
        expect(updatedTasks).toEqual([{ id: 'task-1', title: 'Task 1' }])
    })
    it('обрабатывает ошибку при удалении задачи', async () => {
        console.error = jest.fn()
        setTasks.mockImplementationOnce(() => {
            throw new Error('Test error')
        })
        await handleDeleteTask(taskId, setTasks)
        expect(console.error).toHaveBeenCalledWith('Error deleting task: ', new Error('Test error'))
    })
})
