import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useConn } from '../Context';

const View = () => {
    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";

    interface TaskAssignment {
        From: string | null;
        To: string | undefined;
        PS: string;
        Link: string;
        Remarks: string;
        Deadline: string;
    }
    interface Event {
        type: string;
        payload: TaskAssignment;
    }

    const location = useLocation();
    const { conn } = useConn();
    const { evt } = location.state;

    const [data, setData] = useState<TaskAssignment[]>([]);
    const [dataStatus, setdataStatus] = useState<boolean>(false);
    const [authorizationStatus, setAuthorizationStatus] = useState<boolean>(true);
    const username = localStorage.getItem("username")

    const getTasks = async () => {
        try {

            const newDataList = evt
                .filter((e: Event) => e.type === "new_work" && e.payload.To ===  username)
                .map((e: Event) => ({
                    From: e.payload.From,
                    To: e.payload.To,
                    PS: e.payload.PS,
                    Link: e.payload.Link,
                    Remarks: e.payload.Remarks,
                    Deadline: e.payload.Deadline
                }));

            setData(newDataList); 
            setdataStatus(true);
        } catch (err) {
            console.error({ error: err });
            setAuthorizationStatus(false);
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    useEffect(() => {
        if (conn) {
            conn.onmessage = function (evt) {
                console.log("Message received from backend:", evt);
                const eventData: TaskAssignment = JSON.parse(evt.data);
                console.log(eventData);

                setData(prevData => [
                    ...prevData,
                    {
                        From: eventData.From,
                        To: eventData.To,
                        PS: eventData.PS,
                        Link: eventData.Link,
                        Remarks: eventData.Remarks,
                        Deadline: eventData.Deadline
                    }
                ]);
            };
        } else {
            console.log("WebSocket connection not established.");
        }
    }, [conn]); 

    if (!authorizationStatus) {
        return <Navigate to='/unauthorized_access' />;
    }

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#2C3E50',
            minHeight: '100vh'
        }}>
            {dataStatus && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center'
                }}>
                    {data.map((e, index) => (
                        <div key={index} style={{
                            backgroundColor: '#34495E',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                            color: '#ECF0F1',
                            flex: '1 1 calc(33% - 20px)',
                            maxWidth: 'calc(33% - 20px)',
                            minWidth: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>Assigned by:</span> {e.From}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>Task:</span> {e.PS}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>Link:</span> <a href={`//${e.Link}`} style={{ color: '#3498DB' }}>{e.Link}</a>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>Deadline:</span> {e.Deadline}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>Remarks:</span> {e.Remarks}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default View;
