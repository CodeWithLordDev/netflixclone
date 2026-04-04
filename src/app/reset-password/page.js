import { Suspense } from "react";
import ResetPassword from "./ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
