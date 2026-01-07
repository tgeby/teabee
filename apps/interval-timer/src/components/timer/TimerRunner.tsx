import { useParams } from "react-router-dom";

const TimerRunner = () => {

    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h1>Timer Runner</h1>
            <p>Received id of {`${id}`}</p>
        </div>
    );
};

export default TimerRunner;