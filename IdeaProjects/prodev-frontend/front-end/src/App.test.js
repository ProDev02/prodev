import { render, screen } from "@testing-library/react";
import App from "./App"; // ปรับ path ตามจริง

test("renders Popular Products section", () => {
    render(<App />);
    const heading = screen.getByText(/Popular Products/i);
    expect(heading).toBeInTheDocument();
});

test("renders Featured Categories section", () => {
    render(<App />);
    const heading = screen.getByText(/Featured Categories/i);
    expect(heading).toBeInTheDocument();
});
