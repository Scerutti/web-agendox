import { LEGAL_ENTITY } from './legal-entity';
import { B, DocumentBody, DocumentHeader, Li, P, Section, Ul } from './prose';
import { PRIVACY_VERSION } from './versions';

/**
 * Política de Privacidad. A diferencia de los Términos, no se acepta: informa.
 *
 * La cláusula 4 describe **exactamente** las cookies que la plataforma usa. Si
 * algún día se suma analítica, publicidad o grabación de sesión, hay que
 * actualizarla y ahí sí hace falta pedir consentimiento previo: hoy no, porque
 * todas las cookies son estrictamente necesarias para que la sesión funcione.
 */
export function PrivacyDocument() {
  const { brand, legalName, taxId, address, country, privacyEmail } = LEGAL_ENTITY;

  return (
    <DocumentBody>
      <DocumentHeader
        title="Política de Privacidad"
        version={PRIVACY_VERSION}
        subtitle={`Cómo ${brand} trata los datos personales de quienes usan el servicio, tanto los negocios como las personas que reservan un turno.`}
      />

      <Section n="1" title="Quién es responsable de qué">
        <P>
          <B>{legalName}</B>, CUIT {taxId}, con domicilio en {address}, {country}, es quien presta el
          servicio {brand}. Conviene distinguir dos situaciones, porque el rol cambia:
        </P>
        <Ul>
          <Li>
            <B>Datos de los negocios y de su personal</B> (alta de la cuenta, acceso al panel,
            facturación): {brand} es el <B>responsable</B> del tratamiento.
          </Li>
          <Li>
            <B>Datos de las personas que reservan un turno</B>: el responsable es{' '}
            <B>el negocio</B> con el que se saca el turno. {brand} actúa como{' '}
            <B>encargado del tratamiento</B>: guarda y procesa esos datos por cuenta del negocio y
            siguiendo sus instrucciones. Si querés ejercer tus derechos sobre esos datos, podés
            escribirle al negocio o a nosotros, y te ayudamos a canalizarlo.
          </Li>
        </Ul>
      </Section>

      <Section n="2" title="Qué datos se tratan">
        <Ul>
          <Li>
            <B>Del personal del negocio</B>: nombre, apellido, correo electrónico, rol asignado y
            estado de la cuenta. La contraseña <B>no se guarda</B>: se almacena un valor derivado
            mediante una función de hash resistente, que no permite recuperarla.
          </Li>
          <Li>
            <B>De quien reserva un turno</B>: nombre, apellido, correo electrónico, teléfono o
            WhatsApp cuando se informa, y el detalle de sus turnos (servicio, fecha, hora,
            prestador, estado, importe de la seña e historial). También las notas que el negocio
            decida cargar sobre el turno.
          </Li>
          <Li>
            <B>Datos técnicos</B>: dirección IP, agente de usuario del navegador, fecha y hora de
            los accesos, y registros de errores necesarios para operar y proteger el servicio.
          </Li>
          <Li>
            <B>Evidencia de aceptación de los Términos</B>: cuando el titular de un negocio acepta
            los Términos y Condiciones, se registra la versión aceptada, la fecha, el usuario, su
            dirección IP y su agente de usuario. Es un dato de bajo riesgo que se conserva por su
            valor probatorio.
          </Li>
          <Li>
            <B>Datos de pago de la suscripción</B>: los procesa íntegramente la pasarela de pagos.{' '}
            {brand} <B>no almacena datos completos de tarjetas</B>; solo el estado de la suscripción
            y los identificadores que devuelve la pasarela.
          </Li>
        </Ul>
        <P>
          No se solicitan <B>datos sensibles</B> (salud, origen étnico, opiniones políticas,
          convicciones religiosas, vida sexual, antecedentes penales) y el servicio no está pensado
          para tratarlos. Los negocios se obligan contractualmente a no cargarlos.
        </P>
      </Section>

      <Section n="3" title="Para qué se usan y con qué fundamento">
        <Ul>
          <Li>
            <B>Prestar el servicio</B>: crear y administrar turnos, mostrar la disponibilidad,
            identificar a quien reserva, llevar el historial. Fundamento: la ejecución de la
            relación contractual y del servicio solicitado.
          </Li>
          <Li>
            <B>Enviar avisos operativos</B>: código de acceso al portal, confirmación, rechazo o
            cancelación de un turno, recordatorios y avisos sobre la seña. Son parte del servicio,
            no comunicaciones comerciales.
          </Li>
          <Li>
            <B>Facturar y cobrar</B> la suscripción del negocio, y cumplir obligaciones fiscales.
          </Li>
          <Li>
            <B>Seguridad y diagnóstico</B>: detectar accesos indebidos, prevenir abusos y corregir
            errores. Fundamento: el interés legítimo en mantener el servicio seguro y funcionando.
          </Li>
          <Li>
            <B>Mejorar el producto</B>, exclusivamente sobre estadísticas agregadas que no
            identifican a ninguna persona.
          </Li>
        </Ul>
        <P>
          Los datos <B>no se venden</B>, no se ceden a terceros con fines publicitarios y no se usan
          para crear perfiles con efectos jurídicos sobre las personas.
        </P>
      </Section>

      <Section n="4" title="Cookies y almacenamiento en tu dispositivo">
        <P>
          {brand} usa <B>solo cookies estrictamente necesarias</B> para que la sesión funcione. No
          hay cookies de analítica, de publicidad, de redes sociales, ni de grabación de sesión, y no
          se comparte tu navegación con terceros. Por eso <B>no verás un cartel pidiéndote
          consentimiento</B>: la normativa exime del consentimiento previo a las cookies
          imprescindibles para prestar el servicio que pediste, y pedirlo para estas sería
          confundirte sobre qué se está haciendo con tus datos.
        </P>
        <P>Concretamente:</P>
        <Ul>
          <Li>
            <B>Sesión del panel del negocio</B>: dos cookies con el token de acceso y el de
            renovación. Son <B>httpOnly</B> (el JavaScript de la página no las puede leer) y se
            borran al cerrar sesión.
          </Li>
          <Li>
            <B>Sesión del portal de clientes</B>: una cookie por negocio, creada cuando validás el
            código que te llega por correo, para que no tengas que volver a validarlo en cada
            pantalla. También es httpOnly.
          </Li>
          <Li>
            <B>Sesión del panel de plataforma</B>: una cookie equivalente para los operadores de{' '}
            {brand}.
          </Li>
          <Li>
            <B>Preferencia de tema</B> (claro u oscuro): no es una cookie, es un valor guardado en el
            almacenamiento local de tu navegador. No viaja al servidor y no identifica a nadie.
          </Li>
        </Ul>
        <P>
          Podés borrar estas cookies desde tu navegador en cualquier momento; el efecto será que se
          cierre tu sesión. Si en el futuro se incorporan cookies no necesarias, se pedirá tu
          consentimiento previo antes de instalarlas y esta política se actualizará.
        </P>
      </Section>

      <Section n="5" title="Con quién se comparten">
        <P>
          Solo con proveedores que hacen falta para que el servicio funcione, obligados por contrato
          a tratar los datos únicamente por cuenta de {brand}:
        </P>
        <Ul>
          <Li>
            <B>Alojamiento de la aplicación e infraestructura del servidor</B>, donde corren el panel
            y la API.
          </Li>
          <Li>
            <B>Base de datos gestionada</B>, donde se almacena la información del servicio.
          </Li>
          <Li>
            <B>Proveedor de correo saliente</B>, para los avisos operativos y los códigos de acceso.
          </Li>
          <Li>
            <B>Pasarela de pagos</B>, para cobrar la suscripción de los negocios.
          </Li>
          <Li>
            <B>Servicio de registro de errores</B>, cuando está activado, para diagnosticar fallas.
          </Li>
        </Ul>
        <P>
          Además, los datos se comparten con <B>el negocio con el que sacás el turno</B>, que es
          quien necesita conocerlos para atenderte. También podrán comunicarse a autoridades
          competentes cuando exista un requerimiento legal fundado.
        </P>
      </Section>

      <Section n="6" title="Transferencia internacional">
        <P>
          Parte de la infraestructura puede estar ubicada fuera de la {country}. Esas transferencias
          se realizan al amparo de cláusulas contractuales con los proveedores que garantizan un
          nivel de protección adecuado, conforme al artículo 12 de la Ley 25.326 y su normativa
          complementaria.
        </P>
      </Section>

      <Section n="7" title="Cuánto tiempo se conservan">
        <Ul>
          <Li>
            Mientras la cuenta del negocio esté activa, los datos se conservan para poder prestar el
            servicio y mantener el historial de turnos.
          </Li>
          <Li>
            Cuando una cuenta se da de baja, la baja es lógica: los datos se conservan hasta{' '}
            <B>doce (12) meses</B> para poder atender reclamos y revertir errores, y luego se
            suprimen.
          </Li>
          <Li>
            Los códigos de acceso de un solo uso caducan en minutos. Los registros técnicos se
            conservan por el plazo necesario para seguridad y diagnóstico.
          </Li>
          <Li>
            La documentación fiscal y contable se conserva por los plazos que exige la ley, aun
            después de la baja.
          </Li>
        </Ul>
      </Section>

      <Section n="8" title="Seguridad">
        <P>
          Se aplican medidas técnicas y organizativas razonables: tráfico cifrado con HTTPS,
          contraseñas almacenadas mediante función de derivación de clave, cookies de sesión
          httpOnly, aislamiento de los datos de cada negocio, control de acceso por rol, límites de
          frecuencia de peticiones y registro de actividad. Ningún sistema es infalible: si ocurre un
          incidente que afecte tus datos, se notificará a quien corresponda sin demora indebida.
        </P>
      </Section>

      <Section n="9" title="Tus derechos">
        <P>
          Podés solicitar en cualquier momento el <B>acceso</B>, la <B>rectificación</B>, la{' '}
          <B>actualización</B> y la <B>supresión</B> de tus datos personales, así como la limitación
          de su tratamiento cuando corresponda. El pedido se hace escribiendo a{' '}
          <B>{privacyEmail}</B>, y se responde dentro de los plazos legales.
        </P>
        <P>
          Si tus datos los cargó un negocio que usa {brand}, ese negocio es el responsable: podés
          dirigirte a él directamente, o escribirnos y te ponemos en contacto. Tené en cuenta que la
          supresión de datos vinculados a turnos ya prestados puede estar limitada por las
          obligaciones legales o contables del negocio.
        </P>
        <P>
          Como titular de los datos, tenés derecho a solicitar el retiro o bloqueo de tu nombre de
          nuestros registros. La <B>Agencia de Acceso a la Información Pública</B>, órgano de control
          de la Ley 25.326, atiende las denuncias y reclamos de quienes consideren afectados sus
          derechos.
        </P>
      </Section>

      <Section n="10" title="Menores de edad">
        <P>
          El servicio no está dirigido a menores de edad. Cuando un turno corresponda a una persona
          menor, el negocio es responsable de contar con el consentimiento de quien ejerza su
          responsabilidad parental.
        </P>
      </Section>

      <Section n="11" title="Cambios en esta política">
        <P>
          Esta política está versionada. Si cambia de forma relevante —por ejemplo, si se incorpora
          un proveedor nuevo o un tipo de cookie no necesaria— se publicará la versión actualizada y
          se avisará por correo o desde el panel antes de que empiece a regir.
        </P>
      </Section>

      <Section n="12" title="Contacto">
        <P>
          Para cualquier cuestión sobre datos personales: <B>{privacyEmail}</B>. Domicilio:{' '}
          {address}.
        </P>
      </Section>
    </DocumentBody>
  );
}
