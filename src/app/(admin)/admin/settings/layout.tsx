import { SettingsTabs } from "./tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <h1>Configuración</h1>
          <p className="lede">Nombre, equipo, medición y medios de cobro de la organización.</p>
        </div>
      </header>
      <p className="banner">Los cambios públicos pueden tardar hasta 5 minutos. No hace falta volver a guardarlos.</p>
      <SettingsTabs />
      {children}
    </div>
  );
}
