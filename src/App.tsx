import { useState } from "react"

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>React on Railway</h1>
      <p>
        Built with Vite, served as static files by <code>server.js</code>.
      </p>
      <button onClick={() => setCount((c) => c + 1)}>clicked {count} times</button>
      <p className="hint">
        Edit <code>src/App.tsx</code> and save - the dev server reloads it.
      </p>
    </main>
  )
}
