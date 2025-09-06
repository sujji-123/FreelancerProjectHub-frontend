export default function ProposalList({ proposals }) {
  if (!proposals || proposals.length === 0) return <p>No proposals yet.</p>;
  return (
    <ul className="space-y-2">
      {proposals.map((p) => (
        <li key={p._id} className="border p-3 rounded shadow-sm">
          <p><strong>Freelancer:</strong> {p.freelancer?.name || "Unknown"}</p>
          <p><strong>Amount:</strong> ${p.bidAmount}</p>
          <p><strong>Status:</strong> {p.status}</p>
        </li>
      ))}
    </ul>
  );
}
