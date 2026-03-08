import {useState} from "react"
import api from "../api"

export default function Login(){

 const [email,setEmail]=useState("")
 const [password,setPassword]=useState("")

 const login = async()=>{

   const res = await api.post("/login",{
    email,
    password
   })

   localStorage.setItem("token",res.data.token)

   window.location="/dashboard"
 }

 return(
  <div>

   <h2>Login</h2>

   <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
   <input type="password" placeholder="password" onChange={e=>setPassword(e.target.value)} />

   <button onClick={login}>Login</button>

  </div>
 )
}