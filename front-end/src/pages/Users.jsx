import React, { useEffect, useState } from "react";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Fetch all users
    useEffect(() => {
        fetch("http://localhost:8080/api/users")
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    }, []);

    // Add a new user
    const addUser = () => {
        fetch("http://localhost:8080/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email })
        })
            .then(res => res.json())
            .then(newUser => setUsers([...users, newUser]))
            .catch(err => console.error(err));
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Users</h1>

            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button onClick={addUser}>Add User</button>
            </div>

            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name} ({user.email})</li>
                ))}
            </ul>
        </div>
    );
}
