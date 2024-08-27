import React from 'react';

interface TaskAssignment {
    assigned_by: string | null,
    assigned_to: string | undefined,
    task_message: string,
    link?: string,
    remarks?: string,
    deadline?: string
}

interface TaskDetailsProps {
    task: TaskAssignment;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
    return (
        <div style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#121212'
        }}>
            <h3>Task Details</h3>
            <p><strong>Assigned by:</strong> {task.assigned_by || 'N/A'}</p>
            <p><strong>Assigned to:</strong> {task.assigned_to || 'N/A'}</p>
            <p><strong>Task Message:</strong> {task.task_message}</p>
            {task.link && <p><strong>Link:</strong> <a href={task.link} target="_blank" rel="noopener noreferrer">{task.link}</a></p>}
            {task.remarks && <p><strong>Remarks:</strong> {task.remarks}</p>}
            {task.deadline && <p><strong>Deadline:</strong> {task.deadline}</p>}
        </div>
    );
}

export default TaskDetails;
