"use client";

import { useState } from "react";
import AccountSetup from "../components/AccountSetup";
import CheckInbox from "../components/CheckInbox";

export default function AuthPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {step === 1 && <AccountSetup onNext={() => setStep(2)} />}
      {step === 2 && <CheckInbox />}
    </div>
  );
}
