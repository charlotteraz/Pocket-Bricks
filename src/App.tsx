import Scene from './components/Scene'
import Palette from './components/Palette'
import PlaybackControls from './components/PlaybackControls'
import { useBuildStore } from './store/useBuildStore'

function App() {
  const mode = useBuildStore((s) => s.mode)

  return (
    <div className="relative h-full w-full">
      <Scene />
      {mode === 'edit' ? <Palette /> : <PlaybackControls />}
    </div>
  )
}

export default App
