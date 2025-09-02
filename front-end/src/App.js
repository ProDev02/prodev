import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import SignInPage from "./pages/login/login";
import SignUpPage from "./pages/login/register";
import SignInAdmin from "./pages/login/login_admin";



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin-admin" element={<SignInAdmin />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
