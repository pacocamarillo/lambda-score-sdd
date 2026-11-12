"use client";

import { useState, type CSSProperties } from "react";
import { EmptyTable, PageIntro } from "../listing";
import type { SiteSettings } from "@/modules/site/settings";

type Action = (formData: FormData) => void | Promise<void>;

type WebsiteActions = {
  toggleActive: Action;
  saveTheme: Action;
  saveCover: Action;
  saveNetworks: Action;
  saveContact: Action;
  addSponsor: Action;
  updateSponsor: Action;
  deleteSponsor: Action;
};

export function WebsiteScreen({
  organizationName,
  settings,
  notice,
  error,
  actions,
}: {
  organizationName: string;
  settings: SiteSettings;
  notice?: string;
  error?: string;
  actions: WebsiteActions;
}) {
  const [tab, setTab] = useState<"home" | "news">("home");
  return (
    <div className="stack" style={themeInline(settings)}>
      <PageIntro title="Página web" lede="Inicio, noticias y, cuando se habiliten, menú y páginas propias." />
      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="notice">{notice}</p> : null}
      <section className="card switch-row">
        <div>
          <h2>Habilitar página de inicio</h2>
          <p className="lede">Mientras esté apagada, el sitio público de {organizationName} no se ofrece.</p>
        </div>
        <form action={actions.toggleActive}>
          <input type="hidden" name="active" value={settings.active ? "0" : "1"} />
          <button
            type="submit"
            className={settings.active ? "" : "ghost"}
            aria-pressed={settings.active}
            style={
              settings.active
                ? { background: settings.colorSuccess, borderColor: settings.colorSuccess, color: "#fff" }
                : { background: settings.colorWarning, borderColor: settings.colorWarning, color: "#fff" }
            }
          >
            {settings.active ? "Encendida" : "Apagada"}
          </button>
        </form>
      </section>
      <p className="banner">Los cambios pueden tardar hasta 5 minutos. No hace falta volver a guardarlos.</p>
      <div className="tabs website-tabs" role="tablist" aria-label="Pestañas">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "home"}
          className={tab === "home" ? "is-active" : undefined}
          onClick={() => setTab("home")}
        >
          Página de inicio
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "news"}
          className={tab === "news" ? "is-active" : undefined}
          onClick={() => setTab("news")}
        >
          Noticias
        </button>
      </div>
      {tab === "home" ? <HomeTab settings={settings} actions={actions} /> : <NewsTab />}
    </div>
  );
}

function themeInline(settings: SiteSettings): CSSProperties {
  return {
    ["--brand" as string]: settings.colorPrimary,
    ["--brand-hover" as string]: settings.colorSecondary,
    ["--ok" as string]: settings.colorSuccess,
    ["--danger" as string]: settings.colorWarning,
  };
}

function HomeTab({ settings, actions }: { settings: SiteSettings; actions: WebsiteActions }) {
  const [editing, setEditing] = useState<null | "theme" | "cover" | "networks" | "contact" | "sponsor" | string>(
    null,
  );

  const colors = [
    ["Primario", "colorPrimary", settings.colorPrimary],
    ["Secundario", "colorSecondary", settings.colorSecondary],
    ["Acento", "colorAccent", settings.colorAccent],
    ["Éxito", "colorSuccess", settings.colorSuccess],
    ["Advertencia", "colorWarning", settings.colorWarning],
  ] as const;

  return (
    <div className="stack">
      <div className="cards-2">
        <section className="card">
          <div className="card-head">
            <h2>Colores del tema</h2>
            {editing === "theme" ? null : (
              <button type="button" className="ghost" onClick={() => setEditing("theme")}>
                Editar
              </button>
            )}
          </div>
          {editing === "theme" ? (
            <form action={actions.saveTheme} className="stack">
              {colors.map(([label, name, value]) => (
                <label key={name}>
                  {label}
                  <input name={name} type="color" defaultValue={value} required />
                </label>
              ))}
              <div className="inline-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            colors.map(([name, , value]) => (
              <p className="swatch" key={name}>
                <span>
                  <i style={{ background: value }} />
                  {name}
                </span>
                <span>{value}</span>
              </p>
            ))
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Contenido de la portada</h2>
            {editing === "cover" ? null : (
              <button type="button" className="ghost" onClick={() => setEditing("cover")}>
                Editar
              </button>
            )}
          </div>
          {editing === "cover" ? (
            <form action={actions.saveCover} className="stack">
              <label className="switch-row">
                <input name="coverEnabled" type="checkbox" defaultChecked={settings.coverEnabled} />
                Mostrar sección de portada
              </label>
              <label>
                Imagen o logo (PNG)
                <input name="coverImage" type="file" accept="image/png" />
              </label>
              {settings.coverImage ? (
                <label className="switch-row">
                  <input name="clearImage" type="checkbox" />
                  Quitar imagen actual
                </label>
              ) : null}
              <label>
                Título
                <input name="coverTitle" defaultValue={settings.coverTitle} />
              </label>
              <label>
                Descripción (hasta 2000 caracteres)
                <textarea
                  name="coverDescription"
                  maxLength={2000}
                  rows={5}
                  defaultValue={settings.coverDescription}
                />
              </label>
              <div className="inline-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="switch-row">
                Sección de portada <strong>{settings.coverEnabled ? "Encendida" : "Apagada"}</strong>
              </p>
              <p>Imagen de portada: {settings.coverImage ? "cargada" : "sin archivo."}</p>
              {settings.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.coverImage} alt="" className="site-thumb" />
              ) : null}
              <p>Título: {settings.coverTitle || "sin definir."}</p>
              <p>Descripción: {settings.coverDescription || "sin definir."}</p>
            </>
          )}
        </section>
      </div>

      <section className="card stack">
        <div className="card-head">
          <h2>Patrocinadores</h2>
          {editing === "sponsor" ? null : (
            <button type="button" onClick={() => setEditing("sponsor")}>
              Agregar patrocinador
            </button>
          )}
        </div>
        {editing === "sponsor" ? (
          <form action={actions.addSponsor} className="stack">
            <label>
              Logo (PNG)
              <input name="logo" type="file" accept="image/png" required />
            </label>
            <label>
              Nombre
              <input name="name" required />
            </label>
            <label>
              Dirección del sitio
              <input name="siteUrl" type="url" placeholder="https://" />
            </label>
            <div className="inline-actions">
              <button type="submit">Guardar</button>
              <button type="button" className="ghost" onClick={() => setEditing(null)}>
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
        {settings.sponsors.length === 0 && editing !== "sponsor" ? (
          <EmptyTable
            columns={["Logo", "Nombre", "Dirección del sitio", "Acciones"]}
            message="Todavía no hay patrocinadores. Cada uno lleva logo, nombre y dirección."
          />
        ) : settings.sponsors.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Logo</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Dirección del sitio</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {settings.sponsors.map((sponsor) => (
                  <tr key={sponsor.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sponsor.logoDataUrl} alt="" className="site-thumb" />
                    </td>
                    <td>
                      {editing === sponsor.id ? null : sponsor.name}
                      {editing === sponsor.id ? (
                        <form action={actions.updateSponsor} className="stack">
                          <input type="hidden" name="sponsorId" value={sponsor.id} />
                          <input name="name" defaultValue={sponsor.name} required />
                          <input name="siteUrl" type="url" defaultValue={sponsor.siteUrl} />
                          <input name="logo" type="file" accept="image/png" />
                          <div className="inline-actions">
                            <button type="submit">Guardar</button>
                            <button type="button" className="ghost" onClick={() => setEditing(null)}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </td>
                    <td>
                      {editing === sponsor.id ? null : sponsor.siteUrl ? (
                        <a href={sponsor.siteUrl} target="_blank" rel="noreferrer">
                          {sponsor.siteUrl}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {editing === sponsor.id ? null : (
                        <div className="inline-actions">
                          <button type="button" className="ghost" onClick={() => setEditing(sponsor.id)}>
                            Editar
                          </button>
                          <form action={actions.deleteSponsor}>
                            <input type="hidden" name="sponsorId" value={sponsor.id} />
                            <button type="submit" className="ghost">
                              Eliminar
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <div className="cards-2">
        <section className="card">
          <div className="card-head">
            <h2>Redes</h2>
            {editing === "networks" ? null : (
              <button type="button" className="ghost" onClick={() => setEditing("networks")}>
                Editar
              </button>
            )}
          </div>
          {editing === "networks" ? (
            <form action={actions.saveNetworks} className="stack">
              <label>
                Facebook
                <input name="facebookUrl" type="url" defaultValue={settings.facebookUrl} placeholder="https://" />
              </label>
              <label>
                X
                <input name="xUrl" type="url" defaultValue={settings.xUrl} placeholder="https://" />
              </label>
              <label>
                Instagram
                <input name="instagramUrl" type="url" defaultValue={settings.instagramUrl} placeholder="https://" />
              </label>
              <label>
                YouTube
                <input name="youtubeUrl" type="url" defaultValue={settings.youtubeUrl} placeholder="https://" />
              </label>
              <div className="inline-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <ul className="feature-list">
              <li>Facebook: {settings.facebookUrl || "sin configurar"}</li>
              <li>X: {settings.xUrl || "sin configurar"}</li>
              <li>Instagram: {settings.instagramUrl || "sin configurar"}</li>
              <li>YouTube: {settings.youtubeUrl || "sin configurar"}</li>
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Contacto</h2>
            {editing === "contact" ? null : (
              <button type="button" className="ghost" onClick={() => setEditing("contact")}>
                Editar
              </button>
            )}
          </div>
          {editing === "contact" ? (
            <form action={actions.saveContact} className="stack">
              <label>
                Teléfono de contacto
                <input name="contactPhone" defaultValue={settings.contactPhone} />
              </label>
              <label>
                Correo de contacto
                <input name="contactEmail" type="email" defaultValue={settings.contactEmail} />
              </label>
              <div className="inline-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <p>Teléfono: {settings.contactPhone || "sin configurar"}</p>
              <p>Correo: {settings.contactEmail || "sin configurar"}</p>
              <p className="hint">Si faltan teléfono y correo, el sitio no muestra datos vacíos.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function NewsTab() {
  return (
    <section className="card stack">
      <div className="card-head">
        <h2>Noticias</h2>
        <button type="button" disabled>
          Crear artículo
        </button>
      </div>
      <form className="filters">
        <label>
          Buscar
          <input type="search" placeholder="Buscar artículos" />
        </label>
        <label>
          Estado
          <select defaultValue="all">
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </label>
        <label>
          Desde
          <input type="date" />
        </label>
        <label>
          Hasta
          <input type="date" />
        </label>
      </form>
      <EmptyTable
        columns={["Artículo", "Fecha", "Estado", "Página de inicio", "Acciones"]}
        message="Todavía no hay noticias. Un borrador no se ve en el sitio público."
      />
    </section>
  );
}
