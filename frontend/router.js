import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Example page components
const Index = () => <h1>Index Page</h1>;
const Home = () => <h1>Home Page</h1>;
const Login = () => <h1>Login Page</h1>;
const NotFound = () => <h1>404 - Not Found</h1>;

const AppRouter = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
);

export default AppRouter;