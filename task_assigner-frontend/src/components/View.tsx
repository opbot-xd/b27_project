import axios from 'axios'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'


const View = () => {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";
    const VIEW_TASKS_URL: string = import.meta.env.VITE_VIEW_TASKS_URL as string 
    interface ViewTasks{
        assigned_to: string | null
    }
    const payload: ViewTasks = {
        assigned_to: localStorage.getItem("username")
    }
    const [data, setData] = useState([])
    const [dataStatus, setdataStatus] = useState<boolean>(false)
    const [authorizationStatus,setAuthorizationStatus] = useState<boolean>(true)

    const getTasks = async () => {
        try {
            const response = await axios.post(VIEW_TASKS_URL, JSON.stringify(payload),{headers:{
                'Content-Type':'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            },withCredentials:true})
            setData(response.data)
            setdataStatus(true)
            console.log(response.data)
        } catch (err) {
            console.error({ error: err })
            setAuthorizationStatus(false)
        }
        
    }
    useEffect(()=>{
        getTasks()
    },[])
    if(authorizationStatus===false){
        return <Navigate to = '/unauthorized_access'/>
      }
    return (
        <div>
            {dataStatus && (
                <ol>
                    {data.map((e, index) => (
                        <li key={index}>
                            <ul>
                                <li>Assigned by: {e['assigned_by']}</li>
                                <li>Task: {e['task_message']}</li><br/><br/>
                            </ul>
                        </li>
                    ))}
                </ol>
            )}
        </div>

    )
}

export default View
