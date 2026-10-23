import { useSim } from '../../sim/store';
import { stepTime, togglePause } from '../../sim/actions';
import { useTheme } from '../../state/useTheme';

export default function Header() {
  const sim = useSim();
  const [, toggleTheme] = useTheme();
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="logo">↗</div>
          <div>
            LastMile<small>DELIVERY NETWORK</small>
          </div>
        </div>
        <div className="header-right">
          <span className="live-pill">
            <i className="dot" />
            <span>{sim.paused ? 'SIMULATION PAUSED' : 'SIMULATION LIVE'}</span>
          </span>
          <button className="head-btn" onClick={togglePause}>
            {sim.paused ? '▶ Resume' : 'Ⅱ Pause'}
          </button>
          <button className="head-btn" onClick={stepTime}>+ 5 min</button>
          <button className="head-btn" onClick={toggleTheme} aria-label="Toggle theme">◐ Theme</button>
        </div>
      </div>
    </header>
  );
}
