import { useOne } from "@refinedev/core";

/** Nom de l'admin auteur d'une action (GET /users/:id, mis en cache). */
export function AdminName({ id }: { id: string | null | undefined }) {
  const { data, isLoading, isError } = useOne<{ firstName?: string | null; lastName?: string | null; email?: string | null }>({
    resource: "users",
    id: id ?? "",
    queryOptions: { enabled: !!id, staleTime: 10 * 60 * 1000, retry: false },
  });
  if (!id) return <>—</>;
  if (isLoading) return <>…</>;
  const user = data?.data;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email;
  return <>{!isError && name ? name : `Admin ${id.slice(0, 8)}`}</>;
}
