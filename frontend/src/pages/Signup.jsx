import {useState} from "react"
import api from "../api"

export default function Signup(){

 const [email,setEmail]=useState("")
 const [password,setPassword]=useState("")

 const signup = async()=>{

   const res = await api.post("/signup",{
    email,
    password
   })

   alert(res.data.message)
 }

 return(
  <div>
   <h2>Signup</h2>

   <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
   <input placeholder="password" type="password" onChange={e=>setPassword(e.target.value)} />

   <button onClick={signup}>Signup</button>
  </div>
 )
}