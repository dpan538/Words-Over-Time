type MethodNoteProps = {
  children?: string;
};

export function MethodNote({ children }: MethodNoteProps) {
  return (
    <aside className="border-y border-ink bg-ink px-4 py-6 text-wheat sm:px-6">
      <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.2em] text-sun">
        method note
      </p>
      <p className="mt-3 max-w-5xl text-lg font-black leading-7 sm:text-2xl sm:leading-8">
        {children ??
          "This page currently uses placeholder data. The final version will separate raw corpus evidence, normalized frequency, calculated trend indicators, phrase/collocate relationships, and curated interpretation."}
      </p>
    </aside>
  );
}
