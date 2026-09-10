import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PoliticaPrivacidadePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-6 px-4 py-8">
      <Link
        href="/app"
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Volver
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
          <ShieldCheck className="h-6 w-6 text-sage-600" strokeWidth={2} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Política de Privacidad
        </h1>
      </div>

      <div className="flex flex-col gap-4 text-brown-800">
        <p>
          En NutriMama nos tomamos en serio la privacidad de tu familia y tratamos tus datos
          conforme a la Ley N° 21.719 sobre Protección de Datos Personales de Chile y a las
          demás leyes de protección de datos aplicables en tu país.
        </p>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Qué datos recopilamos
          </h2>
          <p className="mt-1">
            Datos de registro (correo electrónico), datos de tu bebé que decidas informar
            (nombre, fecha de nacimiento, foto opcional) y registros de uso de la app, como
            elementos del menú, alimentos probados y mensajes de soporte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Cómo usamos tus datos
          </h2>
          <p className="mt-1">
            Usamos esos datos exclusivamente para personalizar el contenido de la app según
            la etapa de tu bebé y para brindarte soporte. No vendemos ni compartimos los
            datos de tu bebé con terceros con fines de marketing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Dónde se guardan tus datos
          </h2>
          <p className="mt-1">
            La información se almacena de forma segura, con control de acceso restringido a
            tu propia cuenta (cada mamá solo accede a los datos de sus propios bebés). Las
            fotos se guardan en almacenamiento privado, nunca de forma pública.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Tus derechos</h2>
          <p className="mt-1">
            Puedes editar o eliminar los datos de tu bebé en cualquier momento desde Perfil
            y configuración, y puedes solicitar la eliminación completa de tu cuenta a
            través del Canal de Soporte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Dudas</h2>
          <p className="mt-1">
            Para cualquier duda sobre privacidad o tratamiento de datos, escríbenos por el
            Canal de Soporte dentro de la app.
          </p>
        </section>
      </div>
    </main>
  );
}
