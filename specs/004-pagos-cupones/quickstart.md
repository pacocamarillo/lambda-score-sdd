# Quickstart: Pagos

Con un evento publicado de la feature 003 y las claves de prueba de Stripe y Mercado Pago:

1. Conectar un proveedor y dejar el otro desconectado. El evento solo ofrece el conectado, más transferencia si se activó.
2. Pagar el total con ese proveedor y ver la inscripción confirmada y con folio en menos de un minuto.
3. Repetir el retorno del webhook y comprobar que no hay un segundo folio ni un segundo cobro.
4. Fallar un pago y pagar el mismo total con el otro medio. El intento fallido no descuenta el monto.
5. Intentar abrir dos medios a la vez sobre la misma compra. El segundo se rechaza.
6. Subir un comprobante de transferencia, rechazarlo y comprobar que no hay confirmación ni kit. Aprobar otro y recibir el aviso.
