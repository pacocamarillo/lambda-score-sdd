import { PublicFooter } from "./footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell">
      <main className="auth-shell">{children}</main>
      <PublicFooter />
    </div>
  );
}
