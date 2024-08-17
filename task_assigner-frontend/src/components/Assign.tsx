import { ChangeEvent, FormEvent, useState } from "react"
import axios from 'axios'
import { Navigate } from "react-router-dom"


const Assign = () => {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";
    const TASK_ASSIGN_URL: string = import.meta.env.VITE_TASK_ASSIGN_URL as string
    interface TaskAssignment {
        assigned_by: string | null,
        assigned_to: string | undefined,
        task_message: string
    }
    const username: string | null  = localStorage.getItem("username")
    const targetUser = `${window.location.href}`.split('/')[4]
    const [taskData, setTaskData] = useState<TaskAssignment>({assigned_by: username, assigned_to: targetUser, task_message:''})
    const [assignedStatus, setAssignedStatus] = useState<boolean>(false)
    const [authorizationStatus,setAuthorizationStatus] = useState<boolean>(true)


    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>)=>{
        const {name, value} = event.target
        setTaskData((prevData)=>({...prevData, [name]: value}))
    }

    const handleSubmit = (event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault()

        try{
            const response = axios.post(TASK_ASSIGN_URL, taskData, {withCredentials: true, 
                headers:{
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        })
            console.log(response)
            setAssignedStatus(true)
        }catch(err){
            alert('task allottment failed ! try again')
            console.error({error: err})
            setAuthorizationStatus(false)
        }
    }
    if(assignedStatus){
        return <Navigate to = '/home'/>
    }
    if(authorizationStatus===false){
        return <Navigate to = '/unauthorized_access'/>
      }
  return (
    <form onSubmit={handleSubmit}>
      <textarea name='task_message' value={taskData.task_message} onChange={handleChange}/><br/>
      <button>Assign Task</button>
    </form>
  )
}

export default Assign
