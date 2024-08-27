import React, { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useConn } from '../Context';
import TaskDetails from './TaskDetails';

interface TaskAssignment {
    assigned_by: string | null,
    assigned_to: string | undefined,
    task_message: string,
    link?: string,
    remarks?: string,
    deadline?: string
}

interface TaskEvent {
    type: string;
    payload: TaskAssignment;
}

const Assigns: React.FC = () => {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";
    const { conn } = useConn();
    
    const username: string | null = localStorage.getItem("username");
    const targetUser = `${window.location.href}`.split('/')[4];
    const [taskData, setTaskData] = useState<TaskAssignment>({
        assigned_by: username,
        assigned_to: targetUser,
        task_message: '',
        link: '',
        remarks: '',
        deadline: ''
    });
    const [assignedStatus, setAssignedStatus] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = event.target;
        setTaskData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!conn) {
            console.error('WebSocket connection not established');
            return;
        }
        try {
            const event: TaskEvent = {
                type: "send_work",
                payload: taskData
            };

            conn.send(JSON.stringify(event));
            setAssignedStatus(true);
        } catch (err) {
            alert('Task allotment failed! Try again.');
            console.error({ error: err });
        }
    };

    if (assignedStatus) {
        return <Navigate to='/home' />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit}>
                <textarea
                    name='task_message'
                    placeholder='Task message'
                    value={taskData.task_message}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
                /><br />
                <input
                    type='text'
                    name='link'
                    placeholder='Link (optional)'
                    value={taskData.link}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
                /><br />
                <input
                    type='text'
                    name='remarks'
                    placeholder='Remarks (optional)'
                    value={taskData.remarks}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
                /><br />
                <input
                    type='text'
                    name='deadline'
                    placeholder='Deadline (optional)'
                    value={taskData.deadline}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
                /><br />
                <button style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff' }}>
                    Assign Task
                </button>
            </form>

            <TaskDetails task={taskData} />
        </div>
    );
}

export default Assigns;
