import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SignInPage from "../pages/login/login";
import { BrowserRouter } from "react-router-dom";

// mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
}));

describe("SignInPage", () => {
    const BACKEND_URL = "http://localhost:5000";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.REACT_APP_BACKEND_URL = BACKEND_URL;
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it("renders the page with email and password inputs", () => {
        render(
            <BrowserRouter>
                <SignInPage />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("toggles password visibility", () => {
        render(
            <BrowserRouter>
                <SignInPage />
            </BrowserRouter>
        );

        const passwordInput = screen.getByPlaceholderText(/password/i);
        const toggleButton = screen.getByRole("button", { name: /show password/i });

        expect(passwordInput).toHaveAttribute("type", "password");
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "text");
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("shows success modal on valid USER login", async () => {
        const mockResponse = {
            role: "USER",
            token: "fake-token",
            username: "John",
            email: "john@example.com",
            id: 1,
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            })
        );

        render(
            <BrowserRouter>
                <SignInPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(screen.getByText(/login successful/i)).toBeInTheDocument());

        // wrap runAllTimers in act
        await act(async () => {
            jest.runAllTimers();
        });

        expect(localStorage.getItem("token")).toBe("fake-token");
        expect(mockedNavigate).toHaveBeenCalledWith("/");
    });

    it("shows error modal if login fails", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                text: () => Promise.resolve("Invalid credentials"),
            })
        );

        render(
            <BrowserRouter>
                <SignInPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "wrongpass" } });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(screen.getByText(/login failed/i)).toBeInTheDocument());

        await act(async () => {
            jest.runAllTimers();
        });
    });

    it("shows error modal if role is not USER", async () => {
        const mockResponse = { role: "ADMIN" };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            })
        );

        render(
            <BrowserRouter>
                <SignInPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "admin@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "adminpass" } });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(screen.getByText(/only USER role can login/i)).toBeInTheDocument());

        await act(async () => {
            jest.runAllTimers();
        });
    });
});
