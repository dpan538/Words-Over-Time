export type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type ErrorStatePageProps = {
  code: "404" | "500";
  title: string;
  message: string;
  note: string;
  reset?: () => void;
};
