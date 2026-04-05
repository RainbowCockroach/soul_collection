import React, { useState } from "react";
import toast from "react-hot-toast";
import { useEditorPassword } from "./EditorPasswordContext";

interface SavePushButtonProps {
  fileId: string;
  getData: () => unknown;
  label?: string;
}

const SavePushButton: React.FC<SavePushButtonProps> = ({
  fileId,
  getData,
  label = "Save & Push",
}) => {
  const { saveToServer } = useEditorPassword();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = getData();
      const result = await saveToServer(fileId, data);

      if (result.success) {
        toast.success(result.message || "Saved and pushed!");
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((w) => toast(w, { icon: "\u26a0\ufe0f" }));
        }
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch (error) {
      toast.error("Cannot connect to editor API");
      console.error("Save & Push error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="editor-button editor-button-primary"
    >
      {saving ? "Pushing..." : label}
    </button>
  );
};

export default SavePushButton;
