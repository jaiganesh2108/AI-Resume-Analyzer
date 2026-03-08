import {useState} from "react"
import api from "../api"

export default function UploadResume(){

 const [file,setFile]=useState(null)
 const [result,setResult]=useState(null)

 const upload = async()=>{

  const formData = new FormData()
  formData.append("file",file)

  const res = await api.post("/upload-resume",formData)

  setResult(res.data.analysis)
 }

 return(

  <div>

   <h2>Upload Resume</h2>

   <input type="file" onChange={e=>setFile(e.target.files[0])} />

   <button onClick={upload}>Analyze</button>

   {result && <pre>{result}</pre>}

  </div>
 )
}