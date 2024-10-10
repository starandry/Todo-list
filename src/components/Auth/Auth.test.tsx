import { render } from '@testing-library/react'
import Auth from './Auth'

describe('Auth Component', () => {
    it('renders correctly', () => {
        const mockOnLogin = jest.fn(() => {})
        const { asFragment } = render(<Auth onLogin={mockOnLogin} />)
        expect(asFragment()).toMatchSnapshot()
    })
})
