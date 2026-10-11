import { Component, type ReactNode } from 'react'

// If WebGL is unavailable/disabled, the R3F Canvas throws on mount.
// Without this boundary that error unmounts the whole app -> blank page.
// Here we swallow it: the body's time-of-day sky gradient stays as backdrop
// and every station still reads as a normal page.
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    /* 3D is decorative — degrade silently */
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
