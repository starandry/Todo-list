import { jsx as _jsx } from 'react/jsx-runtime'
import { render } from '@testing-library/react'
import Auth from './Auth'
describe('Auth Component', () => {
    it('renders correctly', () => {
        const mockOnLogin = jest.fn(() => {})
        const { asFragment } = render(_jsx(Auth, { onLogin: mockOnLogin }))
        expect(asFragment()).toMatchSnapshot()
    })
})
