type MetricCardProps = {
  title: string;
  body: string;
};

export function MetricCard({ title, body }: MetricCardProps) {
  return (
    <article className="border border-ink/20 bg-wheat p-5 transition duration-200 hover:-translate-y-1 hover:border-blaze hover:bg-sun/20">
      <h3 className="text-xl font-black leading-none text-ink">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-ink/72">{body}</p>
    </article>
  );
}
