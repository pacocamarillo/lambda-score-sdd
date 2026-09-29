# Contract: Facturación y consola interna

| Ruta | Quién | Resultado |
| --- | --- | --- |
| `/admin/billing` | Propietaria | Estimado del periodo, facturas, pago, medio guardado |
| `/superadmin` | Operador interno | Organizaciones, usuarios, facturas. Una propietaria no entra |
| `/superadmin/invoices/[id]/reconcile` | Operador | Marca pagada una transferencia externa |
| `/superadmin/organizations/[id]/features` | Operador | Incluida en el plan y habilitada, por separado |
| `/superadmin/competitions/[id]/bibs` | Operador | Reasigna folios con confirmación |

El sitio público consulta la factura vencida antes de pintar portada o inscripción. El precio unitario nuevo aplica al periodo que aún no se ha emitido.
