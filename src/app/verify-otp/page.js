import { Suspense } from "react";
import VerifyOtp from "./VerifyOtp";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtp />
    </Suspense>
  );
}
