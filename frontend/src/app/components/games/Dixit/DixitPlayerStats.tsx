export default function DixitPlayerStats({
  state,
}: {
  state: { score: number };
}) {
  return (
    <div className="flex justify-between items-center font-mono">
      <span className="text-zinc-500 text-xs uppercase">Score</span>
      <span className="text-blue-400 font-bold">{state.score}pts</span>
    </div>
  );
}
