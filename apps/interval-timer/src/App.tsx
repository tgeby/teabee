import Layout from "./components/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import TimerMenu from "./components/timer/TimerMenu";
import TimerEditor from "./components/timer/TimerEditor";
import TimerRunner from "./components/timer/TimerRunner";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/timer/menu" />} />
        <Route path="timer/menu" element={<TimerMenu />} />
        <Route path="timer/edit/:id" element={<TimerEditor />} />
        <Route path="timer/run/:id" element={<TimerRunner />} />
      </Route>
    </Routes>
  )
}

export default App
