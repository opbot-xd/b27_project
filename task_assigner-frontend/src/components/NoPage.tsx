import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

const NoPage = () => {
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
      <h1>Page Not Found!</h1>
    </div>
  )
}

export default NoPage
