// The CSS targets `.section#overview`, so keep the id and the `section active` classes.
export default function Section({ id, children }) {
  return (
    <section id={id} className="section active">
      {children}
    </section>
  );
}
