import { useParams } from "react-router-dom";

const TimerEditor = () => {

    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h1>Timer Editor</h1>
            <p>Received id of {`${id}`}</p>
        </div>
    );
};

export default TimerEditor;