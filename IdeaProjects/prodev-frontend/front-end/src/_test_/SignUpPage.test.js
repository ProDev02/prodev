import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpPage from "../pages/login/register";
import { BrowserRouter } from "react-router-dom";

// mock Footer component
jest.mock("../pages/footer", () => () => <div data-testid="footer" />);

describe("SignUpPage", () => {
    const BACKEND_URL = "http://localhost:5000";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.REACT_APP_BACKEND_URL = BACKEND_URL;
    });

    it("renders all input fields and button", () => {
        render(
            <BrowserRouter>
                <SignUpPage />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("toggles password visibility", () => {
        render(
            <BrowserRouter>
                <SignUpPage />
            </BrowserRouter>
        );

        const passwordInput = screen.getByPlaceholderText(/password/i);
        const toggleButton = screen.getByRole("button", { name: "" }); // button has no accessible name

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "text");

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("shows success modal on valid registration", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Registered successfully" }),
            })
        );

        render(
            <BrowserRouter>
                <SignUpPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() =>
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
        );

        fireEvent.click(screen.getByRole("button", { name: /ok/i }));
        expect(screen.queryByText(/registration successful/i)).not.toBeInTheDocument();
    });

    it("shows error message if registration fails", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                text: () => Promise.resolve("Email already exists"),
            })
        );

        render(
            <BrowserRouter>
                <SignUpPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "john@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() =>
            expect(screen.getByText(/register failed: email already exists/i)).toBeInTheDocument()
        );
    });
});
