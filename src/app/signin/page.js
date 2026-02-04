import { Suspense } from "react";
import SigninClient from "./SigninClient";

export const dynamic = "force-dynamic";

export default function SigninPage() {
  return (
    <Suspense fallback={null}>
      <SigninClient />
    </Suspense>
  );
}
