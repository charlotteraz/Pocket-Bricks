import Scene from './components/Scene'
import Palette from './components/Palette'
import PlaybackControls from './components/PlaybackControls'
import SetPreview from './components/SetPreview'
import StartScreen from './components/StartScreen'
import { useBuildStore } from './store/useBuildStore'

function App() {
  const mode = useBuildStore((s) => s.mode)
  const started = useBuildStore((s) => s.started)

  return (
    <div className="relative h-full w-full">
      <Scene />
      {mode === 'edit' ? (
        <>
          <Palette />
          <SetPreview />
        </>
      ) : (
        <PlaybackControls />
      )}
      {!started && <StartScreen />}
    </div>
  )
}

export default App
