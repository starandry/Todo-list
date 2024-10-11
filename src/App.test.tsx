// helpers.test.ts
import { handleAddTask } from './helpers'
import { handleDeleteTask } from './taskHelpers'

// Тесты для handleAddTask
describe('handleAddTask', () => {
    it('устанавливает ошибку, если заголовок пуст', () => {
        const setError = jest.fn() // Мокируем функцию setError

        handleAddTask('', 'Some description', new Date(), { uid: '123' }, setError)

        expect(setError).toHaveBeenCalledWith('Task title is required.')
    })

    it('устанавливает ошибку, если описание пусто', () => {
        const setError = jest.fn() // Мокируем функцию setError

        handleAddTask('Some title', '', new Date(), { uid: '123' }, setError)

        expect(setError).toHaveBeenCalledWith('Task description is required.')
    })

    it('устанавливает ошибку, если дата не выбрана', () => {
        const setError = jest.fn() // Мокируем функцию setError

        handleAddTask('Some title', 'Some description', null, { uid: '123' }, setError)

        expect(setError).toHaveBeenCalledWith('Please select a date for the task.')
    })

    it('устанавливает ошибку, если пользователь не аутентифицирован', () => {
        const setError = jest.fn() // Мокируем функцию setError

        handleAddTask('Some title', 'Some description', new Date(), null, setError)

        expect(setError).toHaveBeenCalledWith('User is not authenticated.')
    })
})

describe('handleDeleteTask', () => {
    const setTasks = jest.fn() // Мокируем setTasks
    const taskId = 'test-task-id'

    beforeEach(() => {
        jest.clearAllMocks() // Очищаем моки перед каждым тестом
    })

    it('удаляет задачу из списка задач', async () => {
        // Массив задач перед удалением
        const prevTasks = [
            { id: 'task-1', title: 'Task 1' },
            { id: 'test-task-id', title: 'Task to be deleted' },
        ]

        // Вызываем функцию
        await handleDeleteTask(taskId, setTasks)

        // Проверяем, что setTasks был вызван с правильной функцией
        expect(setTasks).toHaveBeenCalledWith(expect.any(Function))

        // Проверяем, что функция правильно обновляет список задач
        const updateFn = setTasks.mock.calls[0][0] // Получаем переданную функцию
        const updatedTasks = updateFn(prevTasks) // Вызываем функцию обновления

        expect(updatedTasks).toEqual([{ id: 'task-1', title: 'Task 1' }]) // Задача должна быть удалена
    })

    it('обрабатывает ошибку при удалении задачи', async () => {
        // Мокаем console.error для проверки обработки ошибок
        console.error = jest.fn()

        // Мокаем setTasks, чтобы вызвать ошибку
        setTasks.mockImplementationOnce(() => {
            throw new Error('Test error')
        })

        // Вызываем функцию, которая выбросит ошибку
        await handleDeleteTask(taskId, setTasks)

        // Проверяем, что ошибка была залогирована
        expect(console.error).toHaveBeenCalledWith('Error deleting task: ', new Error('Test error'))
    })
})
