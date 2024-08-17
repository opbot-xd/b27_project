import {useState, useEffect} from 'react'
import {Link, Navigate} from 'react-router-dom'
import axios, {AxiosResponse} from 'axios'

const Home = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const GET_USERS_URL: string = import.meta.env.VITE_GET_USERS_URL as string
  const LOGOUT_URL: string = import.meta.env.VITE_LOGOUT_URL as string
  const username: string | null = localStorage.getItem("username")
  const [apiResponse, setApiResponse] = useState<any[]>([])
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [logoutSuccessStatus,setLogoutSuccessStatus] = useState<boolean>(false)
  const [authorizationStatus,setAuthorizationStatus] = useState<boolean>(true)

  const getUsers = async()=>{
    try{
      const response: AxiosResponse<any, any> = await axios.get(GET_USERS_URL,{withCredentials: true, 
        headers:{
        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
      }
    })
      console.log(response)
      setApiResponse(response.data['users'])
      setLoadingState(false)
    }catch(err){
      console.error({error: err})
      setAuthorizationStatus(false)
      
    }
  }
  const logout = async()=>{
    try{
      axios.post(LOGOUT_URL,JSON.stringify({"message":"terminate session"}),{withCredentials: true})
      localStorage.clear()
      sessionStorage.clear()
      setLogoutSuccessStatus(true)
    }catch(err){
      console.error({error:err})
    }
  }
  useEffect(()=>{
    getUsers()
  },[])
  if(logoutSuccessStatus){
    return <Navigate to = '/'/>
  }
  if(authorizationStatus==false){
    return <Navigate to = '/unauthorized_access'/>
  }
    return (
      <>
      <button onClick={logout}>Logout!</button>&ensp;<Link to = '/view_tasks'><button>View Tasks!</button></Link>
      <h1>Welcome {username} !</h1>
      <h3>List of users: </h3>
      {
        loadingState == false ? apiResponse.map((element, index)=>(
          <li key = {index}><Link to = {{pathname: `/assign/${element}`}}>{element}</Link></li>
        )): null
      }
      </>
    )
}

export default Home
