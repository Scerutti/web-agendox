import { LEGAL_ENTITY } from './legal-entity';
import { B, DocumentBody, DocumentHeader, Heading, Li, P, Section, Ul } from './prose';
import { TERMS_VERSION } from './versions';

/**
 * Términos y Condiciones del servicio: el contrato entre la plataforma y el
 * negocio que la usa. No es el contrato entre el negocio y sus clientes — esa
 * relación es del negocio y la plataforma no es parte (ver cláusula 8).
 *
 * El Anexo I es el acuerdo de tratamiento de datos personales, que es la parte
 * que hace falta porque la plataforma guarda datos de terceros (los clientes del
 * negocio) por cuenta del negocio.
 */
export function TermsDocument() {
  const { brand, legalName, taxId, address, jurisdiction, country, contactEmail, privacyEmail } =
    LEGAL_ENTITY;

  return (
    <DocumentBody>
      <DocumentHeader
        title="Términos y Condiciones del servicio"
        version={TERMS_VERSION}
        subtitle={`Estos términos regulan el uso de ${brand} por parte del negocio que contrata el servicio. Al aceptarlos, el negocio queda obligado por su contenido, incluido el Anexo I sobre tratamiento de datos personales.`}
      />

      <Section n="1" title="Quién presta el servicio">
        <P>
          <B>{brand}</B> es un servicio de agenda y reserva de turnos en línea prestado por{' '}
          <B>{legalName}</B>, CUIT {taxId}, con domicilio en {address}, {country}. Para cualquier
          cuestión relativa a estos términos, el canal de contacto es{' '}
          <B>{contactEmail}</B>.
        </P>
      </Section>

      <Section n="2" title="Definiciones">
        <Ul>
          <Li>
            <B>Plataforma</B>: el software {brand}, sus paneles de administración, la página pública
            de reservas de cada negocio y las interfaces que los conectan.
          </Li>
          <Li>
            <B>Negocio</B>: la persona humana o jurídica que contrata el servicio para gestionar sus
            turnos. Es la parte que acepta estos términos.
          </Li>
          <Li>
            <B>Usuario del Negocio</B>: cada persona a la que el Negocio le da acceso al panel
            (dueño, administración, recepción, prestadores).
          </Li>
          <Li>
            <B>Cliente Final</B>: la persona que reserva un turno con el Negocio a través de la
            página pública de reservas.
          </Li>
          <Li>
            <B>Seña</B>: el importe que el Negocio le pide al Cliente Final para confirmar un turno,
            cuando decide exigirlo.
          </Li>
        </Ul>
      </Section>

      <Section n="3" title="Objeto y alcance del servicio">
        <P>
          La Plataforma le permite al Negocio publicar sus servicios y horarios, recibir reservas,
          administrar su agenda, gestionar su cartera de clientes y enviar notificaciones asociadas
          a los turnos. La Plataforma es una herramienta de gestión: <B>no presta</B> los servicios
          que el Negocio ofrece, no interviene en su ejecución ni garantiza su calidad.
        </P>
        <P>
          El alcance concreto de las funcionalidades disponibles puede variar según el plan
          contratado y según las funcionalidades que la Plataforma tenga habilitadas para el
          Negocio. Las funcionalidades en desarrollo se muestran deshabilitadas y no forman parte de
          lo contratado hasta que se anuncien como disponibles.
        </P>
      </Section>

      <Section n="4" title="Alta de la cuenta y credenciales">
        <P>
          Las cuentas de Negocio las crea la Plataforma: no hay registro automático. El Negocio
          declara que los datos que aporta para el alta son exactos y se compromete a mantenerlos
          actualizados.
        </P>
        <P>
          El Negocio es responsable de las credenciales de sus Usuarios, de los accesos que
          concede y de toda la actividad realizada desde su cuenta. Debe dar de baja el acceso de
          quien deja de trabajar con él y avisar sin demora a {contactEmail} si detecta un uso no
          autorizado.
        </P>
      </Section>

      <Section n="5" title="Planes, precio y facturación">
        <Ul>
          <Li>
            El servicio se contrata por suscripción, en la modalidad y con el precio del plan
            elegido. Los importes se expresan en pesos argentinos y, salvo indicación en contrario,
            no incluyen impuestos.
          </Li>
          <Li>
            La suscripción <B>se renueva automáticamente</B> al final de cada período, por períodos
            iguales, hasta que el Negocio la cancele.
          </Li>
          <Li>
            El período de prueba, cuando se ofrece, no exige medio de pago y termina en la fecha
            informada en el panel. Al terminar sin suscripción activa, el acceso a la operación
            queda restringido; los datos se conservan según la cláusula 15.
          </Li>
          <Li>
            El Negocio puede cancelar en cualquier momento desde el panel. La cancelación evita la
            renovación siguiente y no genera reintegros proporcionales por el período en curso, que
            se presta hasta su vencimiento.
          </Li>
          <Li>
            Ante falta de pago, la Plataforma puede restringir el acceso a la operación tras
            notificar al Negocio, conservando sus datos por el plazo de la cláusula 15.
          </Li>
          <Li>
            Los precios pueden modificarse con un preaviso de <B>treinta (30) días</B> por correo
            electrónico o por aviso en el panel. Si el Negocio no acepta el nuevo precio, puede
            cancelar antes de que empiece a regir.
          </Li>
        </Ul>
      </Section>

      <Section n="6" title="Medios de pago de la suscripción">
        <P>
          El cobro de la suscripción se procesa a través de una pasarela de pagos externa. Los datos
          de la tarjeta o del medio de pago los trata directamente esa pasarela conforme a sus
          propios términos: la Plataforma <B>no almacena datos completos de medios de pago</B>.
        </P>
      </Section>

      <Section n="7" title="Señas y cobros entre el Negocio y sus Clientes Finales">
        <P>
          Esta cláusula es importante y conviene leerla despacio. Cuando el Negocio configura una
          seña para confirmar turnos, <B>el dinero va directamente del Cliente Final al Negocio</B>,
          por los medios que el Negocio informa (por ejemplo, transferencia a su cuenta bancaria).
        </P>
        <P>
          En consecuencia, la Plataforma <B>no recibe, no retiene, no administra ni procesa</B> esos
          importes, y no actúa como agente de cobro, custodio ni depositario. La Plataforma solo
          registra el estado de la seña que el propio Negocio declara. Quedan a cargo exclusivo del
          Negocio la verificación de los pagos, la emisión de comprobantes, las devoluciones, la
          política de cancelación y cualquier reclamo del Cliente Final relacionado con esos
          importes.
        </P>
        <P>
          El Negocio se obliga a informarle a sus Clientes Finales, de forma clara y previa a la
          reserva, el importe de la seña, el plazo para abonarla y sus condiciones de devolución.
        </P>
      </Section>

      <Section n="8" title="Obligaciones del Negocio y uso aceptable">
        <P>
          La relación con los Clientes Finales es del Negocio. La Plataforma no es parte de esa
          relación ni responde por su cumplimiento. El Negocio se obliga a:
        </P>
        <Ul>
          <Li>
            Usar el servicio conforme a la ley, y contar con base legal suficiente para cargar y
            tratar los datos personales de sus Clientes Finales y de sus Usuarios.
          </Li>
          <Li>
            Informarle a sus Clientes Finales que utiliza {brand} para gestionar los turnos y que
            sus datos se almacenan en esta Plataforma por su cuenta y orden.
          </Li>
          <Li>
            <B>No cargar datos sensibles</B> — en particular datos de salud, origen racial o étnico,
            opiniones políticas, convicciones religiosas, vida sexual o antecedentes penales — en
            campos de texto libre como notas de turno, descripciones o nombres de servicios. La
            Plataforma no está diseñada ni certificada para tratar categorías especiales de datos, y
            hacerlo queda bajo exclusiva responsabilidad del Negocio.
          </Li>
          <Li>
            No usar el servicio para enviar comunicaciones no solicitadas, ni para cargar contenido
            ilícito, engañoso o que infrinja derechos de terceros.
          </Li>
          <Li>
            No intentar vulnerar la seguridad de la Plataforma, acceder a datos de otros negocios,
            realizar ingeniería inversa, ni someterla a cargas automatizadas que degraden el
            servicio para los demás.
          </Li>
          <Li>
            Mantener la exactitud de la información pública que publica (servicios, precios,
            horarios y condiciones de cancelación).
          </Li>
        </Ul>
      </Section>

      <Section n="9" title="Datos y contenido del Negocio">
        <P>
          Los datos que el Negocio carga o genera en la Plataforma —su configuración, sus servicios,
          su agenda, su cartera de clientes y su historial de turnos— <B>son del Negocio</B>. La
          Plataforma no adquiere titularidad sobre ellos.
        </P>
        <P>
          El Negocio le otorga a la Plataforma una licencia limitada, no exclusiva y revocable para
          alojar, procesar, transmitir y mostrar esos datos <B>con el único fin de prestar el
          servicio</B>, incluidas las copias de respaldo y las tareas técnicas necesarias para
          operarlo. La Plataforma no vende datos del Negocio ni de sus Clientes Finales, y no los
          usa para publicidad de terceros.
        </P>
        <P>
          La Plataforma puede elaborar estadísticas agregadas y anonimizadas sobre el uso del
          servicio —que no permiten identificar al Negocio ni a persona alguna— para medir y mejorar
          su funcionamiento.
        </P>
      </Section>

      <Section n="10" title="Disponibilidad, mantenimiento y soporte">
        <P>
          La Plataforma se esfuerza razonablemente por mantener el servicio disponible, pero{' '}
          <B>en esta etapa no compromete un nivel de servicio (SLA) ni un porcentaje de
          disponibilidad</B>. Puede haber ventanas de mantenimiento, actualizaciones e
          interrupciones por causas propias o de sus proveedores de infraestructura.
        </P>
        <P>
          El servicio se presta en el estado en que se encuentra y con las funcionalidades
          efectivamente disponibles. La Plataforma puede modificar, agregar o discontinuar
          funcionalidades; si discontinúa una funcionalidad relevante, lo avisa con antelación
          razonable por correo o desde el panel.
        </P>
        <P>
          El soporte se brinda por correo electrónico a {contactEmail}, en días hábiles y sin plazo
          de respuesta comprometido, salvo que el plan contratado indique otra cosa.
        </P>
      </Section>

      <Section n="11" title="Notificaciones y dependencia de terceros">
        <P>
          La Plataforma envía avisos por correo electrónico, notificaciones dentro del panel y
          notificaciones push del navegador cuando el destinatario las habilita. La entrega de esos
          avisos depende de terceros —proveedores de correo, filtros anti-spam, sistemas operativos
          y navegadores— y por eso <B>no se garantiza</B> su recepción, ni su recepción en un plazo
          determinado.
        </P>
        <P>
          El Negocio no debe usar estos avisos como único medio para cuestiones críticas, y sigue
          siendo responsable de la gestión de su agenda.
        </P>
      </Section>

      <Section n="12" title="Propiedad intelectual de la Plataforma">
        <P>
          El software, el diseño, las marcas, los nombres y todo elemento de la Plataforma son
          propiedad de {legalName} o de sus licenciantes. Estos términos otorgan un derecho de uso
          limitado, no exclusivo, no transferible y revocable mientras la suscripción esté vigente:
          no implican cesión de derechos de propiedad intelectual.
        </P>
      </Section>

      <Section n="13" title="Limitación de responsabilidad">
        <P>
          En la máxima medida permitida por la ley, la Plataforma no responde por lucro cesante,
          pérdida de chance, daño indirecto o pérdida de datos que el Negocio pudiera haber evitado
          con recaudos razonables. Tampoco responde por turnos no cumplidos, ausencias de Clientes
          Finales, señas no abonadas o no devueltas, ni por decisiones comerciales del Negocio.
        </P>
        <P>
          La responsabilidad total de la Plataforma frente al Negocio, por cualquier causa y en
          conjunto, se limita al <B>monto efectivamente abonado por el Negocio en los últimos tres
          (3) meses</B> anteriores al hecho que genera el reclamo.
        </P>
        <P>
          Estas limitaciones no se aplican al dolo, la culpa grave, ni a los supuestos en que la ley
          no admite limitación —en particular, a los derechos que la normativa de defensa del
          consumidor reconozca de forma indisponible.
        </P>
      </Section>

      <Section n="14" title="Indemnidad">
        <P>
          El Negocio mantendrá indemne a la Plataforma frente a reclamos de terceros —incluidos sus
          Clientes Finales, sus Usuarios y autoridades— originados en el incumplimiento de estos
          términos, en el contenido que cargó, en la falta de base legal para tratar datos
          personales, o en los servicios que el Negocio presta.
        </P>
      </Section>

      <Section n="15" title="Suspensión, baja y conservación de datos">
        <Ul>
          <Li>
            La Plataforma puede suspender el acceso ante falta de pago, ante un incumplimiento
            grave de estos términos, o ante un riesgo concreto de seguridad. Salvo urgencia, la
            suspensión se notifica al Negocio.
          </Li>
          <Li>
            La baja de una cuenta es <B>lógica y reversible</B>: la cuenta deja de operar pero los
            datos se conservan, para poder responder reclamos y para que un error se pueda revertir.
          </Li>
          <Li>
            El Negocio puede pedir la exportación de sus datos y la supresión definitiva
            escribiendo a {privacyEmail}. La supresión se ejecuta dentro de un plazo razonable,
            salvo los datos que la Plataforma deba conservar por obligación legal (por ejemplo,
            documentación fiscal).
          </Li>
          <Li>
            Transcurridos <B>doce (12) meses</B> desde la baja sin reactivación ni pedido de
            exportación, la Plataforma puede suprimir definitivamente los datos del Negocio.
          </Li>
        </Ul>
      </Section>

      <Section n="16" title="Modificación de estos términos">
        <P>
          Estos términos están versionados: la versión vigente es la que se muestra al pie de esta
          página. Cuando la Plataforma introduce un cambio sustantivo, publica la nueva versión y{' '}
          <B>vuelve a pedir la aceptación</B> en el panel del Negocio. Se registra qué versión se
          aceptó, quién la aceptó y cuándo.
        </P>
        <P>
          Si el Negocio no acepta la nueva versión, puede cancelar la suscripción; continuar usando
          el servicio después de aceptarla implica su conformidad. Las correcciones de redacción que
          no alteran obligaciones no generan una nueva versión.
        </P>
      </Section>

      <Section n="17" title="Confidencialidad">
        <P>
          Cada parte se obliga a no divulgar la información confidencial de la otra a la que acceda
          por esta relación, y a usarla solo para cumplir con estos términos. La obligación subsiste
          por <B>dos (2) años</B> desde la terminación y no alcanza a la información pública ni a la
          que deba revelarse por orden de autoridad competente.
        </P>
      </Section>

      <Section n="18" title="Cesión">
        <P>
          El Negocio no puede ceder su posición contractual sin conformidad previa por escrito. La
          Plataforma puede cederla en caso de reorganización, fusión o transferencia de su negocio,
          notificando al Negocio y sin que eso disminuya sus derechos.
        </P>
      </Section>

      <Section n="19" title="Ley aplicable, jurisdicción y consumidor">
        <P>
          Estos términos se rigen por las leyes de la {country}. Para toda controversia serán
          competentes los tribunales ordinarios de {jurisdiction}, con renuncia a cualquier otro
          fuero.
        </P>
        <P>
          Cuando el Negocio revista el carácter de consumidor en los términos de la Ley 24.240,
          nada de lo previsto acá limita los derechos que esa normativa le reconoce, incluida la
          posibilidad de acudir al fuero de su domicilio y a los organismos de defensa del
          consumidor.
        </P>
      </Section>

      <Section n="20" title="Contacto">
        <P>
          Consultas contractuales y comerciales: {contactEmail}. Cuestiones sobre datos personales:{' '}
          {privacyEmail}. Domicilio para notificaciones formales: {address}.
        </P>
      </Section>

      <Heading>Anexo I — Acuerdo de tratamiento de datos personales</Heading>

      <P>
        Este anexo forma parte integrante de los Términos y Condiciones y se aplica siempre que la
        Plataforma trate datos personales por cuenta del Negocio. Se rige por la Ley 25.326 de
        Protección de los Datos Personales y su normativa complementaria.
      </P>

      <Section n="A.1" title="Roles de las partes">
        <P>
          El <B>Negocio es el responsable</B> del tratamiento de los datos personales de sus
          Clientes Finales y de sus Usuarios: decide qué datos recoge, con qué finalidad y sobre qué
          base legal. La <B>Plataforma es el encargado</B> del tratamiento: los trata únicamente por
          cuenta y siguiendo las instrucciones del Negocio, con el fin de prestarle el servicio.
        </P>
        <P>
          Respecto de sus propios datos de facturación y de los datos de contacto de los Usuarios
          para administrar el acceso, la Plataforma actúa como responsable. Eso se describe en la
          Política de Privacidad.
        </P>
      </Section>

      <Section n="A.2" title="Objeto, duración y categorías de datos">
        <Ul>
          <Li>
            <B>Objeto</B>: alojamiento y procesamiento de los datos necesarios para gestionar
            turnos, clientes, recursos y notificaciones.
          </Li>
          <Li>
            <B>Duración</B>: mientras la suscripción esté vigente, más el plazo de conservación
            posterior a la baja previsto en la cláusula 15.
          </Li>
          <Li>
            <B>Titulares</B>: Clientes Finales del Negocio y Usuarios del Negocio.
          </Li>
          <Li>
            <B>Categorías de datos</B>: datos de identificación y contacto (nombre, apellido, correo
            electrónico, teléfono o WhatsApp), datos de la reserva (servicio, fecha, hora, recurso,
            estado, importe de la seña), notas que el Negocio decida cargar, y datos técnicos de
            acceso (dirección IP, agente de usuario, registros de actividad).
          </Li>
          <Li>
            <B>Datos sensibles</B>: no están previstos. El Negocio se obliga a no cargarlos (ver
            cláusula 8).
          </Li>
        </Ul>
      </Section>

      <Section n="A.3" title="Obligaciones de la Plataforma como encargado">
        <Ul>
          <Li>
            Tratar los datos únicamente para prestar el servicio y conforme a las instrucciones del
            Negocio. <B>No los usa para fines propios</B>, no los cede ni los comercializa.
          </Li>
          <Li>
            Garantizar la confidencialidad, obligando a sus dependientes y colaboradores a
            mantenerla, incluso después de finalizada la relación.
          </Li>
          <Li>
            Aplicar medidas técnicas y organizativas de seguridad adecuadas: cifrado en tránsito
            (HTTPS), contraseñas almacenadas con función de derivación de clave, aislamiento de los
            datos de cada negocio, control de acceso por rol y registros de actividad.
          </Li>
          <Li>
            Asistir al Negocio cuando un titular ejerza sus derechos, y notificarle sin demora
            indebida cualquier solicitud que reciba directamente.
          </Li>
          <Li>
            Notificar al Negocio <B>dentro de las setenta y dos (72) horas</B> de tomar conocimiento
            de un incidente de seguridad que afecte sus datos, informando lo que se sepa sobre su
            alcance y las medidas adoptadas.
          </Li>
          <Li>
            Poner a disposición la información razonable que el Negocio necesite para verificar el
            cumplimiento de este anexo.
          </Li>
        </Ul>
      </Section>

      <Section n="A.4" title="Subencargados">
        <P>
          El Negocio autoriza a la Plataforma a recurrir a proveedores de infraestructura y
          servicios para prestar el servicio, obligándolos por escrito a condiciones no menos
          exigentes que las de este anexo. La categoría y la finalidad de cada proveedor se detallan
          en la Política de Privacidad, que se mantiene actualizada.
        </P>
        <P>
          Cuando la Plataforma incorpore o reemplace un proveedor que trate datos personales, lo
          informará por correo o desde el panel. La Plataforma responde por la actuación de sus
          subencargados como si fuera propia.
        </P>
      </Section>

      <Section n="A.5" title="Transferencia internacional">
        <P>
          La infraestructura que aloja el servicio puede estar ubicada fuera de la {country}. El
          Negocio, como responsable, presta su conformidad para esa transferencia, que la Plataforma
          realiza amparada en cláusulas contractuales con sus proveedores que garantizan un nivel de
          protección adecuado, conforme a los artículos 12 de la Ley 25.326 y su normativa
          complementaria.
        </P>
      </Section>

      <Section n="A.6" title="Devolución y supresión">
        <P>
          Al terminar la relación, y a pedido del Negocio, la Plataforma devuelve los datos en un
          formato de uso corriente y los suprime, salvo los que deba conservar por obligación legal.
          Los plazos son los de la cláusula 15.
        </P>
      </Section>
    </DocumentBody>
  );
}
