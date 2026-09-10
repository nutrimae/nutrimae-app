import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TerminosDeUsoPage() {
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
          <FileText className="h-6 w-6 text-sage-600" strokeWidth={2} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Términos de Uso</h1>
      </div>

      <div className="flex flex-col gap-4 text-brown-800">
        <p>
          Al comprar o usar NutriMama, aceptas estos Términos de Uso. Léelos con calma —
          resumen de forma simple lo que puedes esperar de nosotros y lo que esperamos de ti.
        </p>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Qué es NutriMama</h2>
          <p className="mt-1">
            NutriMama es una herramienta digital de organización y planificación de la rutina
            alimentaria de bebés y niños pequeños: menús por etapa, guías de cortes y
            texturas, listas de compras y contenido de apoyo. No es un servicio médico ni
            reemplaza la orientación de un pediatra o nutricionista — siempre consulta a un
            profesional de salud ante cualquier duda sobre la alimentación de tu bebé.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Acceso y pago
          </h2>
          <p className="mt-1">
            El acceso a los planes de NutriMama se libera automáticamente después de la
            confirmación del pago, mediante un pago único que da acceso de por vida al
            contenido del plan adquirido. Los datos de acceso se envían al correo
            electrónico usado en la compra.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Garantía y reembolso
          </h2>
          <p className="mt-1">
            Ofrecemos 7 días de garantía incondicional a partir de la fecha de la compra. Si
            NutriMama no tiene sentido para tu rutina, te devolvemos el valor pagado, sin
            necesidad de justificar el motivo — solo escríbenos por el Canal de Soporte
            dentro de la app o al correo de contacto.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Uso permitido</h2>
          <p className="mt-1">
            El contenido de NutriMama es para tu uso personal y familiar. No está permitido
            revender, redistribuir ni compartir públicamente el contenido de la app.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Cambios en el servicio
          </h2>
          <p className="mt-1">
            Podemos actualizar o mejorar el contenido y las funciones de NutriMama con el
            tiempo. Los cambios no afectan el acceso ya liberado para quien ya compró el
            plan.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Dudas</h2>
          <p className="mt-1">
            Para cualquier duda sobre estos Términos de Uso, escríbenos por el Canal de
            Soporte dentro de la app.
          </p>
        </section>
      </div>
    </main>
  );
}
