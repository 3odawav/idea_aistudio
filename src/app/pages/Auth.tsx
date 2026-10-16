import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserCheck, Briefcase, ShieldAlert } from "lucide-react";
import { useI18n } from "../i18n/i18n";
import { supabase } from "../backend/supabaseClient";
import { useBackend, type Role } from "../backend/db";
import { Container, Section, Button } from "../components/ui";
import { Panel, Field, inputStyle } from "../components/dash";

function AuthShell({ mode }: { mode: "login" | "register"; defaultRole?: Role }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const { api } = useBackend();
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
    setBusy(true);
    setMessage("");

    if (supabase) {
      try {
        const result = mode === "register"
          ? await supabase.auth.signUp({
              email,
              password,
              options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/account` },
            })
          : await supabase.auth.signInWithPassword({ email, password });

        if (result.error) {
          setMessage(result.error.message);
          setBusy(false);
          return;
        }

        if (mode === "register" && !result.data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
          setBusy(false);
          return;
        }
      } catch (err: any) {
        console.warn("Supabase auth failed, using local session:", err);
      }
    }

    // Ensure session is set in our application state
    api.signIn("credentials", "customer", {
      name: name || email.split("@")[0],
      email,
    });
    setBusy(false);
    nav("/account");
  };

  const handleDemoSignIn = (role: Role) => {
    if (role === "admin") {
      api.signIn("demo", "admin", { name: "IDEA Platform Admin", email: "admin@idea.design" });
      nav("/admin");
    } else if (role === "business") {
      api.signIn("demo", "business", { name: "Ahmed Mozahem (Art Ceramic)", email: "supplier@artceramic.eg" });
      nav("/business");
    } else {
      api.signIn("demo", "customer", { name: "Rakan Sherif", email: "buyer@idea.design" });
      nav("/account");
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
        setMessage("Password reset instructions simulated for " + email);
      }
    } else {
      setMessage("Password reset instructions simulated for " + email);
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

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: "var(--idea-space-5)", paddingTop: "var(--idea-space-4)", borderTop: "var(--idea-hairline)" }}>
            <div className="idea-eyebrow" style={{ textAlign: "center", marginBottom: 10, fontSize: 11 }}>
              Quick Demo Persona Access
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleDemoSignIn("customer")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 6px",
                  borderRadius: "var(--idea-radius-sm)", border: "var(--idea-hairline)", background: "var(--idea-surface-2)",
                  color: "var(--idea-text)", cursor: "pointer", fontSize: 12, textAlign: "center",
                }}
              >
                <UserCheck size={16} color="var(--idea-gold-bright)" />
                <span style={{ fontWeight: 600 }}>Buyer</span>
                <span style={{ fontSize: 10, color: "var(--idea-text-faint)" }}>Account & RFQ</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn("business")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 6px",
                  borderRadius: "var(--idea-radius-sm)", border: "var(--idea-hairline)", background: "var(--idea-surface-2)",
                  color: "var(--idea-text)", cursor: "pointer", fontSize: 12, textAlign: "center",
                }}
              >
                <Briefcase size={16} color="var(--idea-gold-bright)" />
                <span style={{ fontWeight: 600 }}>Supplier</span>
                <span style={{ fontSize: 10, color: "var(--idea-text-faint)" }}>Offers & Orders</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn("admin")}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 6px",
                  borderRadius: "var(--idea-radius-sm)", border: "var(--idea-hairline)", background: "var(--idea-surface-2)",
                  color: "var(--idea-text)", cursor: "pointer", fontSize: 12, textAlign: "center",
                }}
              >
                <ShieldAlert size={16} color="var(--idea-gold-bright)" />
                <span style={{ fontWeight: 600 }}>Admin</span>
                <span style={{ fontSize: 10, color: "var(--idea-text-faint)" }}>Plans & Settings</span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--idea-space-2)", marginTop: "var(--idea-space-4)", color: "var(--idea-text-faint)", fontSize: "var(--idea-text-xs)", textAlign: "center" }}>
            <ShieldCheck size={14} color="var(--idea-gold)" style={{ flexShrink: 0 }} />
            <span>Select any persona above or register with an email to explore the marketplace.</span>
          </div>

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
