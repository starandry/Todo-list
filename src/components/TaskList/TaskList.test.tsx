import { render, screen } from '@testing-library/react'
import TaskList from './TaskList'
import '@testing-library/jest-dom'

describe('TaskList Component', () => {
    it('renders "No tasks for today!" when tasks array is empty', () => {
        const mockOnToggle = jest.fn()
        const mockOnDelete = jest.fn()

        const { asFragment } = render(<TaskList tasks={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

        const messageElement = screen.getByText(/No tasks for today!/i)
        expect(messageElement).toBeInTheDocument()

        expect(asFragment()).toMatchSnapshot()
    })

    it('renders tasks correctly when tasks array is not empty', () => {
        const mockOnToggle = jest.fn()
        const mockOnDelete = jest.fn()

        const tasks = [
            {
                id: '1',
                title: 'Test Task 1',
                description: 'This is the first test task',
                completed: false,
                date: '2024-10-10',
                daysSpent: 3,
                isFrozen: false,
            },
            {
                id: '2',
                title: 'Test Task 2',
                description: 'This is the second test task',
                completed: true,
                date: '2024-10-09',
                daysSpent: 5,
                isFrozen: true,
            },
        ]

        const { asFragment } = render(<TaskList tasks={tasks} onToggle={mockOnToggle} onDelete={mockOnDelete} />)

        const firstTaskTitle = screen.getByText(/Test Task 1/i)
        const secondTaskTitle = screen.getByText(/Test Task 2/i)

        expect(firstTaskTitle).toBeInTheDocument()
        expect(secondTaskTitle).toBeInTheDocument()

        expect(asFragment()).toMatchSnapshot()
    })
})
