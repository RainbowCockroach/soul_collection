import { useEffect, useState, type FormEvent } from "react";
import "./PageSetPassword.css";

const ENDPOINT =
  "https://09176645.xyz/github-pages-editor/set-password/soul_collection";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const PageSetPassword: React.FC = () => {
  const [key, setKey] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const readKey = () => {
      const raw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      setKey(raw.trim());
    };
    readKey();
    window.addEventListener("hashchange", readKey);
    return () => window.removeEventListener("hashchange", readKey);
  }, []);

  useEffect(() => {
    const prev = document.querySelector('meta[name="robots"]');
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
      if (prev) document.head.appendChild(prev.cloneNode(true));
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!key) {
      setStatus({
        kind: "error",
        message:
          "Missing key. Open the full link you were given (it should end with #<key>).",
      });
      return;
    }
    if (!password) {
      setStatus({ kind: "error", message: "Enter a password." });
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch(`${ENDPOINT}/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setStatus({
          kind: "error",
          message: `Request failed (${res.status}). ${text}`.trim(),
        });
        return;
      }
      setStatus({ kind: "success" });
      setPassword("");
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error.",
      });
    }
  };

  return (
    <div className="set-password-page">
      <div className="set-password-card">
        <h1>Set password</h1>
        <p className="set-password-sub">
          Set the editor password for <code>soul_collection</code>.
        </p>

        {!key && (
          <div className="set-password-warning">
            No key detected in the URL. This page must be opened with your link
            ending in <code>#&lt;key&gt;</code>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="set-password-label" htmlFor="set-password-input">
            New password
          </label>
          <div className="set-password-input-row">
            <input
              id="set-password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              spellCheck={false}
              disabled={status.kind === "submitting"}
            />
            <button
              type="button"
              className="set-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="set-password-submit"
            disabled={status.kind === "submitting" || !key}
          >
            {status.kind === "submitting" ? "Setting..." : "Set password"}
          </button>
        </form>

        {status.kind === "success" && (
          <div className="set-password-success">Password updated.</div>
        )}
        {status.kind === "error" && (
          <div className="set-password-error">{status.message}</div>
        )}
      </div>
    </div>
  );
};

export default PageSetPassword;
