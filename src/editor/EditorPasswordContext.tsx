import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getSavedPassword,
  savePassword as persistPassword,
  clearPassword,
  verifyPassword,
  saveAndPush,
  type SaveResult,
} from "./editor-api";

interface EditorPasswordContextType {
  isAuthenticated: boolean;
  password: string | null;
  saveToServer: (fileId: string, content: unknown) => Promise<SaveResult>;
  logout: () => void;
}

const EditorPasswordContext = createContext<EditorPasswordContextType | null>(null);

export function useEditorPassword(): EditorPasswordContextType {
  const context = useContext(EditorPasswordContext);
  if (!context) {
    throw new Error("useEditorPassword must be used within EditorPasswordProvider");
  }
  return context;
}

export const EditorPasswordProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checkingStored, setCheckingStored] = useState(true);

  // On mount, check if there's a stored password and verify it
  useEffect(() => {
    const stored = getSavedPassword();
    if (stored) {
      verifyPassword(stored)
        .then((valid) => {
          if (valid) {
            setPassword(stored);
            setIsAuthenticated(true);
          } else {
            clearPassword();
            setShowModal(true);
          }
        })
        .catch(() => {
          // API not running — let user in without server auth
          setShowModal(true);
        })
        .finally(() => setCheckingStored(false));
    } else {
      setShowModal(true);
      setCheckingStored(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError("Password is required");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const valid = await verifyPassword(passwordInput);
      if (valid) {
        persistPassword(passwordInput);
        setPassword(passwordInput);
        setIsAuthenticated(true);
        setShowModal(false);
        setPasswordInput("");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Cannot connect to editor API. Is it running on port 3003?");
    } finally {
      setVerifying(false);
    }
  };

  const logout = useCallback(() => {
    clearPassword();
    setPassword(null);
    setIsAuthenticated(false);
    setShowModal(true);
  }, []);

  const saveToServer = useCallback(
    async (fileId: string, content: unknown): Promise<SaveResult> => {
      if (!password) {
        return { success: false, message: "", error: "Not authenticated" };
      }
      const result = await saveAndPush(fileId, content, password);
      if (result.error === "Invalid password") {
        logout();
      }
      return result;
    },
    [password, logout]
  );

  if (checkingStored) {
    return (
      <div className="editor-container page-padded" style={{ textAlign: "center", padding: "60px" }}>
        <div className="editor-loading-spinner" />
        <p style={{ marginTop: "16px", color: "var(--editor-purple-400)" }}>Checking authentication...</p>
      </div>
    );
  }

  if (showModal) {
    return (
      <div className="editor-password-overlay">
        <div className="div-3d-with-shadow editor-password-modal">
          <h2 style={{ margin: "0 0 20px 0", color: "var(--editor-purple-900)" }}>
            Editor Password
          </h2>
          <form onSubmit={handleSubmit} className="editor-password-form">
            <div className="editor-field">
              <label className="editor-label" htmlFor="editor-password">
                Enter password to continue:
              </label>
              <input
                type="password"
                id="editor-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="editor-input"
                autoFocus
                disabled={verifying}
              />
              {error && (
                <div style={{ color: "var(--editor-danger)", marginTop: "8px", fontSize: "14px" }}>
                  {error}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="editor-button editor-button-primary editor-button-large"
              disabled={verifying}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {verifying ? "Verifying..." : "Unlock Editor"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <EditorPasswordContext.Provider value={{ isAuthenticated, password, saveToServer, logout }}>
      {children}
    </EditorPasswordContext.Provider>
  );
};
