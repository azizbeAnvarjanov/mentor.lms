// app/private/page.tsx

import { getCurrentUserWithStudent } from "../hooks/getCurrentUserWithStudent";

export default async function PrivatePage() {
  const { user, teacher } = await getCurrentUserWithStudent();

  return (
    <p>
      Hello {teacher.fio}
    </p>
  );
}
