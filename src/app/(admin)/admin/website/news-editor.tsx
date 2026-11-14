"use client";

import { useRef, useState } from "react";

export function NewsEditor({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLInputElement>(null);

  function run(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  function syncHtml() {
    if (htmlRef.current && editorRef.current) {
      htmlRef.current.value = editorRef.current.innerHTML;
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}>
        Crear artículo
      </button>
    );
  }

  return (
    <form
      action={action}
      className="stack"
      onSubmit={syncHtml}
    >
      <label>
        Título
        <input name="title" required />
      </label>
      <label>
        Imagen principal (16:9 o 1366×768, PNG/JPG)
        <input name="image" type="file" accept="image/png,image/jpeg" required />
      </label>
      <div className="editor-toolbar" role="toolbar" aria-label="Formato">
        <button type="button" className="ghost" onClick={() => run("bold")}>
          Negrita
        </button>
        <button type="button" className="ghost" onClick={() => run("italic")}>
          Cursiva
        </button>
        <button type="button" className="ghost" onClick={() => run("underline")}>
          Subrayado
        </button>
        <button type="button" className="ghost" onClick={() => run("formatBlock", "h2")}>
          Subtítulo
        </button>
        <button type="button" className="ghost" onClick={() => run("insertUnorderedList")}>
          Viñetas
        </button>
        <button type="button" className="ghost" onClick={() => run("insertOrderedList")}>
          Numeración
        </button>
        <button type="button" className="ghost" onClick={() => run("justifyLeft")}>
          Izquierda
        </button>
        <button type="button" className="ghost" onClick={() => run("justifyCenter")}>
          Centro
        </button>
        <button type="button" className="ghost" onClick={() => run("justifyRight")}>
          Derecha
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => {
            const url = window.prompt("URL del enlace");
            if (url) run("createLink", url);
          }}
        >
          Enlace
        </button>
        <label className="ghost">
          Tamaño
          <select
            defaultValue="3"
            onChange={(event) => run("fontSize", event.target.value)}
          >
            <option value="2">Pequeño</option>
            <option value="3">Normal</option>
            <option value="4">Grande</option>
            <option value="5">Muy grande</option>
          </select>
        </label>
        <label className="ghost">
          Fuente
          <select
            defaultValue="sans-serif"
            onChange={(event) => run("fontName", event.target.value)}
          >
            <option value="sans-serif">Sans</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
          </select>
        </label>
      </div>
      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Contenido del artículo"
        onInput={syncHtml}
        suppressContentEditableWarning
      />
      <input ref={htmlRef} type="hidden" name="contentHtml" defaultValue="" />
      <div className="inline-actions">
        <button type="submit" name="publish" value="1" onClick={syncHtml}>
          Guardar artículo
        </button>
        <button type="button" className="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
