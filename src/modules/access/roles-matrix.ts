export type MatrixCell = "Sí" | "No" | "Consulta" | "Sí, si la función está activa" | "Sí, en la consola";

export type MatrixRow = {
  access: string;
  cells: Record<string, MatrixCell>;
};

export const ROLE_COLUMNS = [
  "Visita",
  "Participante",
  "Propietaria",
  "Administrador",
  "Staff solo lectura",
  "Staff operador",
  "Staff admin. de evento",
  "Operador interno",
] as const;

export const ROLES_MATRIX: MatrixRow[] = [
  row("Sitio público, ficha del evento, inscripción y resultados publicados", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí"),
  row("Portal: sus propias inscripciones y confirmación", "No", "Sí", "No", "No", "No", "No", "No", "No"),
  row("Inicio del panel, eventos y participantes del evento", "No", "No", "Sí", "Sí", "Consulta", "Sí", "Sí", "No"),
  row("Alta, edición y borrado de inscripciones", "No", "No", "Sí", "Sí", "No", "Sí", "Sí", "No"),
  row("Check-in, entrega de kit y verificación de pagos", "No", "No", "Sí", "Sí", "No", "Sí", "Sí", "No"),
  row("Configurar el evento, competencias, formulario y medios de pago", "No", "No", "Sí", "Sí", "No", "No", "Sí", "No"),
  row("Resultados, fotos y código de cronometraje del evento", "No", "No", "Sí", "Sí", "Consulta", "Consulta", "Sí", "No"),
  row("Cupones de la organización", "No", "No", "Sí", "Sí", "No", "No", "No", "No"),
  row("Sitio web de la organización", "No", "No", "Sí", "Sí", "No", "No", "No", "No"),
  row("Contactos de la organización", "No", "No", "Sí", "Sí", "No", "No", "No", "No"),
  row("Comunicaciones y analítica", "No", "No", "Sí, si la función está activa", "Sí, si la función está activa", "No", "No", "No", "No"),
  row("Facturación de la plataforma y medio de pago de esa factura", "No", "No", "Sí", "No", "No", "No", "No", "Sí, en la consola"),
  row("Configuración de la organización y dominio", "No", "No", "Sí", "No", "No", "No", "No", "No"),
  row("Invitar, editar y eliminar miembros", "No", "No", "Sí", "No", "No", "No", "No", "No"),
  row("Perfil: cambiar su nombre y su contraseña", "No", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí"),
  row("Consola interna: organizaciones, facturas, funciones y reasignar folios", "No", "No", "No", "No", "No", "No", "No", "Sí"),
];

function row(
  access: string,
  visit: MatrixCell,
  participant: MatrixCell,
  owner: MatrixCell,
  admin: MatrixCell,
  viewer: MatrixCell,
  operator: MatrixCell,
  eventAdmin: MatrixCell,
  internal: MatrixCell,
): MatrixRow {
  return {
    access,
    cells: {
      Visita: visit,
      Participante: participant,
      Propietaria: owner,
      Administrador: admin,
      "Staff solo lectura": viewer,
      "Staff operador": operator,
      "Staff admin. de evento": eventAdmin,
      "Operador interno": internal,
    },
  };
}
