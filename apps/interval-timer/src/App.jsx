import { Gradient } from "@repo/ui/gradient";
function App() {

  return (
    <>
      <div className="min-h-screen flex flex-col bg-main-background-1000">
        <p>sfld</p>
        <div className="absolute z-50 flex items-center justify-center w-64 h-64">
              <Gradient
                className="opacity-90 w-[120px] h-[120px]"
                conic
                small
              />
            </div>
      </div>
    </>
  )
}

export default App
