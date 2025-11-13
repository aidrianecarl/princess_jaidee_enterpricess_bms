export function PasswordStrength({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? "bg-primary" : "bg-neutral-300"}`} />
        ))}
      </div>
      <p className="text-xs text-neutral-600">{strengthLabels[strength]}</p>
      <ul className="text-xs space-y-1">
        <li className={checks.length ? "text-green-600" : "text-neutral-400"}>✓ At least 8 characters</li>
        <li className={checks.uppercase ? "text-green-600" : "text-neutral-400"}>✓ Uppercase letter</li>
        <li className={checks.lowercase ? "text-green-600" : "text-neutral-400"}>✓ Lowercase letter</li>
        <li className={checks.number ? "text-green-600" : "text-neutral-400"}>✓ Number</li>
      </ul>
    </div>
  )
}
