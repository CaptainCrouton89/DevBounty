import { AuthUI } from "@/components/AuthUI";
import { Message } from "@/components/form-message";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return <AuthUI defaultView="reset-password" message={searchParams} />;
}
