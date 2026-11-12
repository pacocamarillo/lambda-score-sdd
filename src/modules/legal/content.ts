export type LegalDoc = {
  slug: "aviso-de-privacidad" | "terminos" | "cookies";
  title: string;
  updated: string;
  sections: Array<{ heading?: string; paragraphs: string[] }>;
};

export const PRIVACY_NOTICE: LegalDoc = {
  slug: "aviso-de-privacidad",
  title: "Aviso de privacidad integral",
  updated: "Noviembre de 2026",
  sections: [
    {
      paragraphs: [
        'Lambda Score Multiservicios S.A.S. de C.V. (en adelante, "Lambda Score"), con domicilio ubicado en Calle 3 Sur #2910, Col. Francisco I. Madero, Atlixco, Puebla, C.P. 74290, correo electrónico de contacto contacto@lambdascore.com.mx y teléfono (244) 144-2188, es responsable del tratamiento y protección de sus datos personales, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.',
      ],
    },
    {
      heading: "1. ¿Qué datos personales recabamos?",
      paragraphs: [
        "Para llevar a cabo las finalidades descritas en el presente aviso, Lambda Score podrá recabar las siguientes categorías de datos personales, ya sea a través de nuestro sitio web, plataformas de registro, redes sociales o de forma presencial:",
        "Datos de Identificación y Contacto; Datos Deportivos (para eventos); Datos Financieros y de Facturación; Datos de Imagen y Multimedia.",
      ],
    },
    {
      heading: "2. ¿Para qué fines utilizamos sus datos personales?",
      paragraphs: [
        "Los datos personales que recabamos serán utilizados para las siguientes finalidades primarias, necesarias para la prestación de nuestros servicios: gestión de eventos deportivos; logística y comercialización; atención al cliente y soporte; facturación y cumplimiento fiscal.",
        "De manera adicional, utilizaremos su información para finalidades secundarias: envío de boletines informativos, notificaciones sobre próximas convocatorias, aperturas de inscripciones y eventos deportivos; promociones, ofertas comerciales y publicidad relacionada con productos y servicios de Lambda Score o marcas aliadas.",
        "Si usted no desea que sus datos personales sean tratados para las finalidades secundarias, puede manifestarlo en cualquier momento enviando un correo electrónico a contacto@lambdascore.com.mx.",
      ],
    },
    {
      heading: "3. Transferencia de datos personales",
      paragraphs: [
        "Lambda Score no comercializará, venderá ni alquilará sus datos personales a terceros. Sus datos podrán ser compartidos nacional o internacionalmente solo cuando sea estrictamente necesario con proveedores de plataformas de pago y pasarelas tecnológicas, autoridades competentes, y organizadores asociados o municipios.",
      ],
    },
    {
      heading: "4. Medios para ejercer los Derechos ARCO",
      paragraphs: [
        "Usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición respecto de sus datos personales. Para ejercer cualquiera de los derechos ARCO, o para revocar su consentimiento, deberá enviar una solicitud por escrito al correo electrónico oficial contacto@lambdascore.com.mx o comunicarse al teléfono 244 144 2188, incluyendo nombre completo y medio de respuesta, copia de identificación oficial vigente, y descripción clara de los datos respecto de los cuales busca ejercer el derecho.",
      ],
    },
    {
      heading: "5. Uso de Cookies y Tecnologías de Rastreo",
      paragraphs: [
        "En nuestra página web utilizamos cookies, web beacons y otras tecnologías a través de las cuales es posible monitorear su comportamiento como usuario de internet, brindarle un mejor servicio y experiencia de navegación, así como ofrecerle publicidad basada en sus preferencias. Estas tecnologías pueden ser deshabilitadas directamente desde las opciones de configuración de su navegador web.",
      ],
    },
    {
      heading: "6. Modificaciones al Aviso de Privacidad",
      paragraphs: [
        "El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los servicios que ofrecemos, o por cambios en nuestro modelo de negocio. Cualquier modificación estará disponible y podrá ser consultada en todo momento a través de nuestra página web oficial.",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  slug: "terminos",
  title: "Términos y condiciones generales de uso y registro",
  updated: "Noviembre de 2026",
  sections: [
    {
      paragraphs: [
        'Bienvenido al sitio web y plataforma de registros de Lambda Score Multiservicios S.A.S. de C.V. (en adelante, "Lambda Score"), con domicilio fiscal en Calle 3 Sur #2910, Col. Francisco I. Madero, Atlixco, Puebla, C.P. 74290. Al acceder, navegar o utilizar nuestro sitio web, registrarte en un evento deportivo o adquirir productos o servicios, aceptas cumplir y quedar sujeto a los siguientes Términos y Condiciones. Si no estás de acuerdo con alguno de ellos, te pedimos abstenerte de utilizar nuestros servicios.',
      ],
    },
    {
      heading: "1. Objeto del Sitio Web",
      paragraphs: [
        "Lambda Score ofrece una plataforma digital para la inscripción y registro a eventos deportivos (carreras de ruta, ciclismo MTB, trail running, entre otros), venta de prendas deportivas y artículos personalizados, así como la consulta de resultados y tiempos de competencia obtenidos mediante sistemas de cronometraje electrónico.",
      ],
    },
    {
      heading: "2. Registro de Usuario y Veracidad de la Información",
      paragraphs: [
        "Para completar una inscripción a un evento o realizar una compra, el usuario debe proporcionar información verídica, exacta, actualizada y completa.",
        "El usuario es responsable de mantener la confidencialidad de los datos de su cuenta y de todas las actividades que ocurran bajo la misma.",
        "Lambda Score no se hace responsable por errores en la entrega de kits, tallas de prendas o asignación de categorías derivados de datos incorrectos proporcionados por el usuario.",
      ],
    },
    {
      heading: "3. Inscripciones a Eventos y Políticas de Cancelación",
      paragraphs: [
        "La inscripción queda sujeta a confirmación según el estado de pago del evento. El carácter de la inscripción puede ser intransferible según las reglas del organizador. Las cancelaciones, devoluciones y causas de fuerza mayor se atienden conforme a la convocatoria de cada evento y a la legislación aplicable.",
      ],
    },
    {
      heading: "4. Pagos y Facturación",
      paragraphs: [
        "Los pagos en línea se procesan a través de plataformas de terceros seguras. Lambda Score no almacena datos de tarjetas de crédito o débito en sus servidores.",
        "Si requieres factura fiscal (CFDI), deberás solicitarla durante el proceso de compra o dentro del mes en curso de tu pago, proporcionando tus datos fiscales completos.",
      ],
    },
    {
      heading: "5. Exoneración de Responsabilidad Deportiva",
      paragraphs: [
        "La participación en eventos deportivos implica riesgos físicos inherentes. Al inscribirse a un evento a través de nuestra plataforma, el participante declara estar en adecuadas condiciones de salud física y mental para realizar la prueba.",
        "El participante exime de toda responsabilidad civil, penal o administrativa a Lambda Score Multiservicios S.A.S. de C.V., sus directivos, colaboradores y patrocinadores por cualquier lesión, accidente, pérdida de pertenencias o percance ocurrido durante el desarrollo del evento.",
      ],
    },
    {
      heading: "6. Uso de Imagen",
      paragraphs: [
        "Al participar en un evento organizado o cronometrado por Lambda Score, el usuario autoriza de manera gratuita el uso de su imagen (fotografías, videos, grabaciones de voz) para fines promocionales, informativos y de difusión en los canales oficiales y redes sociales de Lambda Score y sus aliados.",
      ],
    },
    {
      heading: "7. Contacto y Soporte",
      paragraphs: [
        "Para cualquier duda, aclaración o solicitud relacionada con los presentes Términos y Condiciones: Domicilio Calle 3 Sur #2910, Col. Francisco I. Madero, Atlixco, Puebla, C.P. 74290; Correo contacto@lambdascore.com.mx; Teléfono (244) 144-2188.",
      ],
    },
  ],
};

export const COOKIES_POLICY: LegalDoc = {
  slug: "cookies",
  title: "Política de cookies",
  updated: "Noviembre de 2026",
  sections: [
    {
      paragraphs: [
        "En Lambda Score Multiservicios S.A.S. de C.V. utilizamos cookies y tecnologías similares de rastreo para mejorar tu experiencia de navegación, optimizar el rendimiento de la plataforma y ofrecerte contenidos adaptados a tus preferencias.",
      ],
    },
    {
      heading: "1. ¿Qué son las Cookies?",
      paragraphs: [
        "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo al visitar un sitio web. Nos permiten recordar tus acciones y preferencias durante un periodo de tiempo.",
      ],
    },
    {
      heading: "2. Tipos de Cookies que utilizamos",
      paragraphs: [
        "Cookies estrictamente necesarias; cookies de rendimiento y analítica; cookies de funcionalidad; cookies de publicidad y redes sociales.",
      ],
    },
    {
      heading: "3. ¿Cómo administrar o desactivar las Cookies?",
      paragraphs: [
        "Puedes configurar tu navegador web para que bloquee o te alerte sobre la presencia de cookies. Si desactivas las cookies estrictamente necesarias, es posible que algunas secciones del sitio o de la plataforma de inscripciones no funcionen adecuadamente.",
      ],
    },
    {
      heading: "4. Actualizaciones de la Política de Cookies",
      paragraphs: [
        "Podemos actualizar nuestra Política de Cookies periódicamente. Te recomendamos revisar esta sección de manera regular.",
      ],
    },
  ],
};

export function legalBySlug(slug: string): LegalDoc | null {
  if (slug === PRIVACY_NOTICE.slug) return PRIVACY_NOTICE;
  if (slug === TERMS.slug) return TERMS;
  if (slug === COOKIES_POLICY.slug) return COOKIES_POLICY;
  return null;
}
