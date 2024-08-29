import { ChangeEvent, FormEvent, useState } from "react"
import axios from 'axios'
import { Navigate } from "react-router-dom"
import { useConn } from '../Context'; 



const Assign = () => {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";
    const { conn } = useConn();

    interface TaskAssignment {
        from: string | null,
        to: string | undefined,
        ps: string
        link: string
        remarks: string
        deadline: string
    }

    interface Event {
        type: string;
        payload: TaskAssignment;
      }
    const username: string | null  = localStorage.getItem("username")
    const targetUser = `${window.location.href}`.split('/')[4]
    const [taskData, setTaskData] = useState<TaskAssignment>({from: username, to: targetUser, ps:'', link: "", remarks:"", deadline:""})
    const [assignedStatus, setAssignedStatus] = useState<boolean>(false)

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = event.target
        setTaskData((prevData)=>({...prevData, [name]: value}))
    }

    const handleSubmit = async(event:FormEvent<HTMLFormElement>)=>{
        event.preventDefault()

        if(taskData.deadline=="" || taskData.link=="" ||taskData.remarks=="" ||taskData.deadline==""){
          alert("All fields are mandatory! Please try again")
          return
        }

        if (!conn) {
            console.error('WebSocket connection not established');
            return;
          }
        try{

            const event: Event = {
                type:"send_work",
                payload:taskData
            }

            conn.send(JSON.stringify(event))
            conn!.close()
            setTimeout(()=>{
              setAssignedStatus(true)
            },100)
        }catch(err){
            alert('task allottment failed ! try again')
            console.error({error: err})
        }
    }
    if(assignedStatus){
        return <Navigate to = '/home'/>
    }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#2C3E50', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor='ps' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ECF0F1' }}>Task Description:</label>
                <textarea id='ps' name='ps' value={taskData.ps} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #BDC3C7', boxSizing: 'border-box', backgroundColor: '#34495E', color: '#ECF0F1' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor='link' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ECF0F1' }}>Link:</label>
                <input id='link' name='link' type='text' value={taskData.link} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #BDC3C7', boxSizing: 'border-box', backgroundColor: '#34495E', color: '#ECF0F1' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor='remarks' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ECF0F1' }}>Remarks:</label>
                <input id='remarks' name='remarks' type='text' value={taskData.remarks} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #BDC3C7', boxSizing: 'border-box', backgroundColor: '#34495E', color: '#ECF0F1' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor='deadline' style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ECF0F1' }}>Deadline:</label>
                <input id='deadline' name='deadline' type='text' value={taskData.deadline} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #BDC3C7', boxSizing: 'border-box', backgroundColor: '#34495E', color: '#ECF0F1' }} />
            </div>
            <button type='submit' style={{ backgroundColor: '#3498DB', color: '#ffffff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Assign Task</button>
        </form>
  )
}

export default Assign
