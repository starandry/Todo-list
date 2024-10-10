import { render } from '@testing-library/react'
import Task from './Task'

describe('Task Component', () => {
    it('renders correctly', () => {
        const mockOnToggle = jest.fn()
        const mockOnDelete = jest.fn()

        const { asFragment } = render(
            <Task
                id="1"
                title="Test Task"
                description="This is a test task"
                completed={false}
                date="2024-10-10"
                daysSpent={5}
                isFrozen={false}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        )
        expect(asFragment()).toMatchSnapshot()
    })
})
