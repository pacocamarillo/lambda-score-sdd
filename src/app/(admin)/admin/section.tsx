export default function LaterSection({ title }: { title: string }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      <p>Esta sección llega con la siguiente feature. El acceso y los permisos de esta pantalla ya están activos.</p>
    </section>
  );
}
