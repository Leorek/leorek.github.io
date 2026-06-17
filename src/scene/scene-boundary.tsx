import { Component, type ReactNode } from 'react'

// If WebGL is unavailable/disabled, the R3F Canvas throws on mount.
// Without this boundary that error unmounts the whole app -> blank page.
// Here we swallow it and fall back to a static gradient backdrop.
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    /* 3D is decorative — degrade silently */
  }
  render() {
    if (this.state.failed) {
      return (
        <div
          className="scene-canvas"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(110% 80% at 70% 25%, rgba(255,120,73,0.12), transparent 55%), radial-gradient(90% 70% at 20% 70%, rgba(91,108,255,0.10), transparent 60%)',
          }}
        />
      )
    }
    return this.props.children
  }
}
