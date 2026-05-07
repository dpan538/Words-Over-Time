type MetricCardProps = {
  title: string;
  body: string;
};

export function MetricCard({ title, body }: MetricCardProps) {
  return (
    <article className="group border border-ink/20 bg-wheat p-5 transition duration-200 hover:-translate-y-1 hover:border-blaze hover:bg-ink hover:shadow-[8px_8px_0_#F06B04]">
      <h3 className="text-xl font-black leading-none text-ink transition group-hover:text-wheat">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-6 text-ink/72 transition group-hover:text-wheat/80">
        {body}
      </p>
    </article>
  );
}
