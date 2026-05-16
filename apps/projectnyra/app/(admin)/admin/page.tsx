export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm uppercase text-muted-foreground">
          Operator Admin
        </p>
        <h1 className="text-3xl font-semibold">Project Nyra Admin</h1>
      </div>
      <p className="max-w-2xl text-muted-foreground">
        Internal controls for CRM visibility, compliance review, workflow
        health, and assistant operations belong in this route group.
      </p>
    </main>
  );
}
