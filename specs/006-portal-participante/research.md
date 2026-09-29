# Research: Portal del participante

## Decision: La inscripción propia es la que tiene el mismo correo que la sesión

**Rationale**: La spec define la cuenta como la identidad de acceso y la inscripción por el correo titular. No se pide un emparejamiento manual.

**Alternatives considered**: Un identificador interno que el participante nunca vio, obligar a crear cuenta antes de inscribirse (la spec permite inscribirse y entrar después).

## Decision: Confirmación imprimible solo con pago aprobado

**Rationale**: Mismo criterio que el certificado de resultados, con nombre, evento, competencia y folio. Si el folio aún no existe, la confirmación no se ofrece.

**Alternatives considered**: Un comprobante de “registro recibido” con el mismo formato de confirmación (confunde el estado).

## Decision: Edición por bandera en el campo

**Rationale**: `editable_by_participant` la pone el organizador. Nombre, correo y campos únicos siguen bloqueados aunque la bandera esté mal puesta. El archivo se ve y no se reemplaza.
