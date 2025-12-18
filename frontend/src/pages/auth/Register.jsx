import { useState } from "react";
import api from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({});

  const submit = async () => {
    await api.post("/auth/register", form);
    alert("Registered successfully");
  };

  return (
    <>
      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={e => setForm({...form, password:e.target.value})}/>
      <input placeholder="Department" onChange={e => setForm({...form, department:e.target.value})}/>
      <button onClick={submit}>Register</button>
    </>
  );
}
