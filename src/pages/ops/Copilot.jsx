import { useEffect, useRef, useState } from 'react';
import { useSim, getSnapshot } from '../../sim/store';
import { riskyDeliveries } from '../../sim/selectors';
import { askBackend, BRIEF_QUESTION, buildLocalBrief, localCopilotAnswer } from '../../services/copilot';
import Section from '../../components/ui/Section';

const PROMPTS = [
  ['📊 Network status summary', 'Summarize current network status and top risks.'],
  ['♙ Available rider availability', 'Which riders are unassigned and ready for pickup?'],
  ['❄ Dependency rule check', 'Are there cold chain or ration dependency violations?'],
];

const WELCOME = { who: 'LastMile Copilot', text: 'Hello! I am grounded in your current simulation state. How can I assist your logistics operations right now?' };

export default function Copilot() {
  const sim = useSim();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [brief, setBrief] = useState("Click 'Generate Shift Brief' above to produce an AI-written operations summary.");
  const [risks, setRisks] = useState(null); // null = nothing analysed yet
  const conversationRef = useRef(null);

  useEffect(() => {
    const box = conversationRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || thinking) return;
    const snap = getSnapshot();
    setMessages((m) => [...m, { who: 'You', text: q, user: true }]);
    setInput('');
    setThinking(true);
    try {
      const answer = await askBackend(q, snap);
      setMessages((m) => [...m, { who: 'LastMile Copilot', text: answer || 'No answer returned.' }]);
    } catch {
      setMessages((m) => [...m, { who: 'LastMile Copilot · Offline mode', text: `${localCopilotAnswer(q, snap)} (Local rule-based response; connect the optional API backend for AI-generated answers.)` }]);
    } finally {
      setThinking(false);
    }
  };

  const generateBrief = async () => {
    const snap = getSnapshot();
    setBrief('Generating shift brief...');
    try {
      setBrief((await askBackend(BRIEF_QUESTION, snap)) || buildLocalBrief(snap));
    } catch {
      setBrief(buildLocalBrief(snap));
    }
    setRisks(riskyDeliveries(snap));
  };

  return (
    <Section id="ai">
      <div className="ai-hero">
        <div className="ai-orb">✦</div>
        <div>
          <div className="eyebrow">INTELLIGENT OPERATIONS COPILOT</div>
          <h2>Real-Time AI Assistant <span className="ai-badge">GPT-4.1 POWERED</span></h2>
          <p>Ask operational questions grounded directly in your current simulation snapshot.</p>
          <div className="ai-hero-actions">
            <button className="btn lime" onClick={generateBrief}>📄 Generate Shift Brief</button>
            <button className="btn ghost-light" onClick={() => ask('Which deliveries are currently at risk and why?')}>⚠ Analyze At-Risk Items</button>
          </div>
        </div>
        <div className="ai-hero-stat"><span>PROMPT MODEL</span><strong>GPT-4.1</strong><small>Server-side API</small></div>
      </div>

      <div className="ai-grid">
        <div className="panel ai-chat-panel">
          <div className="panel-head"><div><h2>Copilot Conversation</h2><p>Grounded strictly in active network snapshot data</p></div></div>
          <div className="prompt-chips">
            {PROMPTS.map(([label, q]) => <button key={label} className="prompt-chip" onClick={() => ask(q)}>{label}</button>)}
          </div>
          <div className="ai-conversation" ref={conversationRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-message${m.user ? ' user' : ''}`}>
                <div className="ai-avatar">{m.user ? '👤' : '✦'}</div>
                <div><b>{m.who}</b><p>{m.text}</p></div>
              </div>
            ))}
          </div>
          <div className="ai-input-row">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about riders, deliveries, expiry timelines..." onKeyDown={(e) => e.key === 'Enter' && ask(input)} aria-label="Ask the copilot" />
            <button className="btn primary" disabled={thinking} onClick={() => ask(input)}>{thinking ? 'Thinking...' : 'Send ↗'}</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Shift Handover Brief</h2></div>
          <div className="ai-brief" style={{ whiteSpace: 'pre-line' }}>{brief}</div>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Live Risk & Capability Analysis</h2></div>
          <div className="ai-insight-list">
            {risks === null && <div className="ai-empty">No active risk analysis loaded. Run a query or generate a brief.</div>}
            {risks?.length === 0 && <div className="ai-empty">No deliveries are currently flagged at risk.</div>}
            {risks?.map((d) => (
              <div className="ai-insight" key={d.id}>
                <div className="ai-signal">⚠</div>
                <div>
                  <span className="signal-label">HIGH RISK</span>
                  <strong>{d.id} · {d.units} units</strong>
                  <p>{d.deadlineMin} minutes remaining. Verify the assigned rider and route.</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ai-footnote">Note: AI analysis is advisory and does not directly trigger dispatch changes.</div>
        </div>
      </div>
    </Section>
  );
}
