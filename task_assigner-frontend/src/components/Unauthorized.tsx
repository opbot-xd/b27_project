import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

const Unauthorized = () => {
    const [redirect,setRedirect] = useState(false)

    useEffect(()=>{
        setTimeout(()=>{
            setRedirect(true)
        },2000)
    })
    if(redirect){
        return <Navigate to = '/'/>
    }
  return (
    <div>
      <h1>Unauthorized Access! </h1>
    </div>
  )
}

export default Unauthorized