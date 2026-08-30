import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getUsers } from "../api/users.client";
import { usersKeys } from "../api/users.keys";

export function useUsers() {
  return useSafeQuery({
    queryKey: usersKeys.lists(),
    queryFn: getUsers,
  });
}
