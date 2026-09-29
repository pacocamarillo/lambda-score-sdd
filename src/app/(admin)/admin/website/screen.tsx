"use client";

import { useState } from "react";
import { EmptyTable, PageIntro } from "../listing";

const colors = [
  ["Primario", "#1e4d5c"],
  ["Secundario", "#5f6b76"],
  ["Acento", "#1d7a46"],
  ["Éxito", "#1d7a46"],
  ["Advertencia", "#7a4e12"],
];

export function WebsiteScreen({ organizationName }: { organizationName: string }) {
  const [tab, setTab] = useState<"home" | "news">("home");
  return (
    <div className="stack">
      <PageIntro title="Página web" lede="Inicio, noticias y, cuando se habiliten, menú y páginas propias." />
      <section className="card switch-row">
        <div>
          <h2>Habilitar página de inicio</h2>
          <p className="lede">Mientras esté apagada, el sitio público de {organizationName} no se ofrece.</p>
        </div>
        <button type="button" className="ghost" disabled aria-pressed="false">
          Apagada
        </button>
      </section>
      <p className="banner">Los cambios pueden tardar hasta 5 minutos. No hace falta volver a guardarlos.</p>
      <div className="tabs" role="tablist" aria-label="Pestañas">
        <button type="button" role="tab" aria-selected={tab === "home"} aria-current={tab === "home" ? "page" : undefined} onClick={() => setTab("home")}>
          Página de inicio
        </button>
        <button type="button" role="tab" aria-selected={tab === "news"} aria-current={tab === "news" ? "page" : undefined} onClick={() => setTab("news")}>
          Noticias
        </button>
      </div>
      {tab === "home" ? <HomeTab /> : <NewsTab />}
    </div>
  );
}

function HomeTab() {
  return (
    <div className="stack">
      <div className="cards-2">
        <section className="card">
          <div className="card-head">
            <h2>Colores del tema</h2>
            <button type="button" className="ghost" disabled>
              Editar
            </button>
          </div>
          {colors.map(([name, value]) => (
            <p className="swatch" key={name}>
              <span>
                <i style={{ background: value }} />
                {name}
              </span>
              <span>{value}</span>
            </p>
          ))}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Contenido de la portada</h2>
            <button type="button" className="ghost" disabled>
              Editar
            </button>
          </div>
          <p className="switch-row">
            Sección de portada <strong>Apagada</strong>
          </p>
          <p>Imagen de portada: sin archivo.</p>
          <p>Título: sin definir.</p>
          <p>Descripción: sin definir.</p>
        </section>
      </div>
      <section className="card stack">
        <div className="card-head">
          <h2>Patrocinadores</h2>
          <button type="button" disabled>
            Agregar patrocinador
          </button>
        </div>
        <EmptyTable
          columns={["Logo", "Nombre", "Dirección del sitio", "Acciones"]}
          message="Todavía no hay patrocinadores. Cada uno lleva logo, nombre y dirección."
        />
      </section>
      <div className="cards-2">
        <section className="card">
          <div className="card-head">
            <h2>Redes</h2>
            <button type="button" className="ghost" disabled>
              Editar
            </button>
          </div>
          <p>Facebook, X, Instagram y YouTube: sin configurar. No hace falta tener las cuatro.</p>
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Contacto</h2>
            <button type="button" className="ghost" disabled>
              Editar
            </button>
          </div>
          <p>Teléfono y correo: sin configurar. El icono de mensajería está apagado.</p>
          <p className="hint">Si faltan teléfono y correo, el sitio no muestra datos vacíos.</p>
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
