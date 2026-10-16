import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useI18n } from "../i18n/i18n";
import { supabase } from "../backend/supabaseClient";
import { Container, Section, Button } from "../components/ui";
import { Panel, Field, inputStyle } from "../components/dash";

function AuthShell({ mode }: { mode: "login" | "register"; defaultRole?: Role }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password || (mode === "register" && !name)) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (!supabase) {
      setMessage("Account sign-in is unavailable until Supabase is configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = mode === "register"
        ? await supabase.auth.signUp({
            email, password,
            options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/account` },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) { setMessage(result.error.message); return; }
      if (!result.data.session) {
        setMessage("Check your email to confirm your account, then sign in.");
        return;
      }
      nav("/account");
    } catch {
      setMessage("Unable to contact the account service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email) {
      setMessage("Please enter your email to receive reset instructions.");
      return;
    }
    setBusy(true);
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
        setMessage(error ? error.message : "Password reset instructions were sent to your email.");
      } catch {
        setMessage("Password reset could not be completed. Please try again.");
      }
    } else {
      setMessage("Password reset requires the account service.");
    }
    setBusy(false);
  };

  return (
    <Section style={{ paddingTop: "var(--idea-space-8)" }}>
      <Container style={{ maxWidth: 460 }}>
        <Panel>
          <div style={{ textAlign: "center", marginBottom: "var(--idea-space-5)" }}>
            <div className="idea-eyebrow">IDEA ARCHITECTURAL</div>
            <h1 className="idea-display" style={{ fontSize: "var(--idea-text-2xl)", color: "var(--idea-text)", margin: "var(--idea-space-2) 0 0" }}>
              {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
            </h1>
          </div>

          {mode === "register" && (
            <Field label="Full Name">
              <input style={inputStyle} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Rakan Sherif" />
            </Field>
          )}

          <Field label={t("auth.email")}>
            <input style={inputStyle} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" />
          </Field>

          <Field label="Password">
            <input style={inputStyle} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} placeholder="••••••••" />
          </Field>

          {message && (
            <p role="status" style={{ color: "var(--idea-danger)", fontSize: "var(--idea-text-sm)", marginBottom: "var(--idea-space-3)" }}>
              {message}
            </p>
          )}

          <Button style={{ width: "100%" }} disabled={busy} onClick={() => void submit()}>
            <Mail size={16} />
            {busy ? "Working…" : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
            <ArrowRight size={16} />
          </Button>

          {mode === "login" && (
            <div style={{ textAlign: "center", marginTop: "var(--idea-space-3)" }}>
              <button type="button" disabled={busy} onClick={() => void reset()} style={{ display: "inline-flex", alignItems: "center", gap: "var(--idea-space-2)", border: 0, background: "transparent", color: "var(--idea-gold-bright)", cursor: "pointer", fontFamily: "var(--idea-font-body)", fontSize: "var(--idea-text-sm)" }}>
                <KeyRound size={14} />Reset password
              </button>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "var(--idea-space-4)", color: "var(--idea-text-muted)", fontSize: "var(--idea-text-sm)" }}>
            {mode === "login" ? (
              <>
                <span>{t("auth.noAccount")} </span>
                <Link to="/register" style={{ color: "var(--idea-gold-bright)" }}>{t("auth.createAccount")}</Link>
              </>
            ) : (
              <>
                <span>{t("auth.haveAccount")} </span>
                <Link to="/login" style={{ color: "var(--idea-gold-bright)" }}>{t("auth.signIn")}</Link>
              </>
            )}
          </div>
        </Panel>
      </Container>
    </Section>
  );
}

export function Login() {
  return <AuthShell mode="login" />;
}

export function Register() {
  return <AuthShell mode="register" defaultRole="customer" />;
}

export function RegisterCustomer() {
  return <AuthShell mode="register" defaultRole="customer" />;
}

export function RegisterBusiness() {
  return <AuthShell mode="register" defaultRole="business" />;
}

export function RoleSelect() {
  return <Login />;
}
