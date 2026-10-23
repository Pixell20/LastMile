import { useSim } from '../../sim/store';
import Section from '../../components/ui/Section';
import PageHead from '../../components/ui/PageHead';
import StatusBadge from '../../components/ui/StatusBadge';

export default function ActivityLog() {
  const sim = useSim();
  return (
    <Section id="activity">
      <PageHead title="Activity log" subtitle="Full audit log of dispatch decisions, heartbeat updates, and exceptions." />
      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Time</th><th>Actor</th><th>Entity</th><th>Event</th><th>Description</th></tr></thead>
            <tbody>
              {sim.logs.map((l, i) => (
                <tr key={i}>
                  <td>{l.time}</td>
                  <td><b>{l.actor}</b></td>
                  <td>{l.entity}</td>
                  <td><StatusBadge>{l.event}</StatusBadge></td>
                  <td>{l.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
