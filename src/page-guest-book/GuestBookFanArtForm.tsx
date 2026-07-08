import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import ButtonWrapper from "../common-components/ButtonWrapper";
import {
  DoodleCanvas,
  type DoodleCanvasHandle,
} from "./doodle-canvas/DoodleCanvas";
import type { MessageContent } from "./types";
import { apiBaseUrl, SUCCESS_MESSAGE_DURATION_MS } from "../helpers/constants";
import buttonSendArt from "../assets/button_send_art.gif";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";

interface GuestBookFanArtFormProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string,
  ) => Promise<void>;
  submitting?: boolean;
  showForm: boolean;
  onToggle: () => void;
  // Edit mode props
  isEditMode?: boolean;
  initialData?: {
    name?: string;
    thumbnail?: string;
    full_image?: string;
    caption?: string;
    content_warning?: string;
  };
  onCancel?: () => void;
}

const CONTENT_WARNINGS = [
  "Genitals",
  "Nipples",
  "Gore",
  "Drugs",
  "Eldritch horror beyond comprehension",
];

// Square thumbnail size (px). Matches the old ~300px thumbnail width.
const THUMBNAIL_SIZE = 300;

/** Convert a base64 data URL into a Blob (used for the exported doodle PNG). */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Downscale the square doodle PNG into a square thumbnail Blob. The doodle is
 * already 1:1 with a white background, so a straight draw keeps it square and
 * non-transparent.
 */
async function makeSquareThumbnail(
  dataUrl: string,
  size = THUMBNAIL_SIZE,
): Promise<Blob> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () =>
      reject(new Error("Could not load doodle for thumbnail"));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Thumbnail export failed")),
      "image/png",
    );
  });
}

const GuestBookFanArtForm = ({
  onSubmit,
  submitting = false,
  showForm,
  onToggle,
  isEditMode = false,
  initialData,
  onCancel,
}: GuestBookFanArtFormProps) => {
  // Fan art form state
  const [fanArtForm, setFanArtForm] = useState({
    name: isEditMode && initialData?.name ? initialData.name : "",
    thumbnail:
      isEditMode && initialData?.thumbnail ? initialData.thumbnail : "",
    full_image:
      isEditMode && initialData?.full_image ? initialData.full_image : "",
    caption: isEditMode && initialData?.caption ? initialData.caption : "",
    password: "",
  });

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      setFanArtForm({
        name: initialData.name || "",
        thumbnail: initialData.thumbnail || "",
        full_image: initialData.full_image || "",
        caption: initialData.caption || "",
        password: "",
      });

      // Parse content warnings for edit mode
      if (initialData.content_warning) {
        const warnings = initialData.content_warning.split(", ");
        const knownWarnings = warnings.filter((w) =>
          CONTENT_WARNINGS.includes(w),
        );
        const unknownWarnings = warnings.filter(
          (w) => !CONTENT_WARNINGS.includes(w),
        );

        setSelectedContentWarnings(knownWarnings);
        setOtherContentWarning(
          unknownWarnings.length > 0 ? unknownWarnings[0] : "",
        );

        if (unknownWarnings.length > 0) {
          setSelectedContentWarnings((prev) => [...prev, "Other"]);
        }
      }
    }
  }, [isEditMode, initialData]);

  // Doodle + upload state (new submissions only)
  const doodleRef = useRef<DoodleCanvasHandle>(null);
  // Exported doodle blobs held between "Send!" and CAPTCHA solve so a failed
  // CAPTCHA can be retried without re-exporting.
  const pendingImagesRef = useRef<{ full: File; thumb: Blob } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // CAPTCHA state. The token itself is passed directly to uploadAndSubmit
  // rather than kept in state, so we never read a stale (single-use) token.
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  // Content warning multi-select state
  const [selectedContentWarnings, setSelectedContentWarnings] = useState<
    string[]
  >([]);
  // Other content warning text
  const [otherContentWarning, setOtherContentWarning] = useState<string>("");

  const handleFanArtInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFanArtForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Combine selected warnings and the custom "Other" text into one string.
  const buildContentWarning = (): string | null => {
    const allContentWarnings = [...selectedContentWarnings];
    if (
      selectedContentWarnings.includes("Other") &&
      otherContentWarning.trim()
    ) {
      const index = allContentWarnings.indexOf("Other");
      allContentWarnings[index] = otherContentWarning.trim();
    } else if (
      !selectedContentWarnings.includes("Other") &&
      otherContentWarning.trim()
    ) {
      allContentWarnings.push(otherContentWarning.trim());
    } else if (
      selectedContentWarnings.includes("Other") &&
      !otherContentWarning.trim()
    ) {
      allContentWarnings.splice(allContentWarnings.indexOf("Other"), 1);
    }
    return allContentWarnings.length > 0 ? allContentWarnings.join(", ") : null;
  };

  const resetForm = () => {
    setFanArtForm({
      name: "",
      thumbnail: "",
      full_image: "",
      caption: "",
      password: "",
    });
    setSelectedContentWarnings([]);
    setOtherContentWarning("");
    pendingImagesRef.current = null;
    doodleRef.current?.clear();
  };

  const flashSuccess = () => {
    setShowSuccessMessage(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setShowSuccessMessage(false);
    }, SUCCESS_MESSAGE_DURATION_MS);
  };

  // Edit mode: the art itself can't change, only name/caption/warnings. Submit
  // reuses the existing thumbnail/full_image and needs no upload or CAPTCHA.
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent: MessageContent = {
      name: fanArtForm.name || null,
      content: fanArtForm.caption || null,
      thumbnail: fanArtForm.thumbnail || null,
      full_image: fanArtForm.full_image || null,
      caption: fanArtForm.caption || null,
      content_warning: buildContentWarning(),
    };
    try {
      await onSubmit(messageContent, "fan art", fanArtForm.password || null);
      flashSuccess();
    } catch {
      // Parent handles the error; don't show success.
    }
  };

  // New submission: export the doodle, then require a CAPTCHA before uploading.
  const handleFanArtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const empty = await doodleRef.current?.isEmpty();
    if (empty !== false) {
      setUploadError("Please draw something before sending.");
      return;
    }

    try {
      const dataUrl = await doodleRef.current!.exportPng();
      const fullBlob = await dataUrlToBlob(dataUrl);
      const fullFile = new File([fullBlob], "doodle.png", {
        type: "image/png",
      });
      const thumbBlob = await makeSquareThumbnail(dataUrl);
      pendingImagesRef.current = { full: fullFile, thumb: thumbBlob };
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not export your doodle",
      );
      return;
    }

    captchaRef.current?.reset();
    setShowCaptcha(true);
  };

  // Fires when the user solves the CAPTCHA (token) or when a solved token is
  // cleared/expired by the widget (null). On null we just wait for a re-solve —
  // we must NOT reset() here: a widget that fails to load (missing/invalid site
  // key, network) would loop error → reset → error → … indefinitely.
  const handleCaptchaChange = (token: string | null) => {
    if (!token) return;
    setShowCaptcha(false);
    if (pendingImagesRef.current) {
      uploadAndSubmit(
        pendingImagesRef.current.thumb,
        pendingImagesRef.current.full,
        token,
      );
    }
  };

  // The solved token expired before we used it. Reset for a clean re-solve —
  // safe because onExpired only fires after a successful solve, so it can't loop.
  const handleCaptchaExpired = () => {
    captchaRef.current?.reset();
  };

  // The widget itself failed to load/run (network down, invalid site key, …).
  // Do NOT reset() here — that retries the same failing load endlessly.
  const handleCaptchaErrored = () => {
    setShowCaptcha(false);
    setUploadError(
      "Couldn't load the CAPTCHA. You can download your doodle and try again.",
    );
  };

  // Re-open the CAPTCHA to retry uploading the already-exported doodle.
  const handleRetryCaptcha = () => {
    if (!pendingImagesRef.current) return;
    setUploadError(null);
    captchaRef.current?.reset();
    setShowCaptcha(true);
  };

  // Upload the exported doodle (thumbnail + full image) then create the message.
  // Reuses the existing guest image pipeline, which stores both files server-side.
  const uploadAndSubmit = async (
    thumbBlob: Blob,
    fullFile: File,
    token: string,
  ) => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbBlob, "thumbnail.png");
      formData.append("fullImage", fullFile);
      formData.append("captchaToken", token);

      const response = await fetch(`${apiBaseUrl}/upload/images-guest`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload doodle");
      }

      const data = await response.json();

      const messageContent: MessageContent = {
        name: fanArtForm.name || null,
        content: fanArtForm.caption || null,
        thumbnail: data.thumbnailUrl,
        full_image: data.fullImageUrl,
        caption: fanArtForm.caption || null,
        content_warning: buildContentWarning(),
      };

      await onSubmit(messageContent, "fan art", fanArtForm.password || null);

      // Discord notification is sent server-side on message creation.
      resetForm();
      flashSuccess();
    } catch (err) {
      // Keep pendingImagesRef so the user can retry the CAPTCHA or download the
      // doodle — a failed attempt never loses their drawing.
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload doodle",
      );
    } finally {
      setUploading(false);
    }
  };

  // Let the user save their unsubmitted doodle (e.g. if the CAPTCHA fails).
  const handleDownloadDoodle = async () => {
    const empty = await doodleRef.current?.isEmpty();
    if (empty !== false) {
      setUploadError("Draw something first, then you can download it.");
      return;
    }
    const dataUrl = await doodleRef.current?.exportPng();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "doodle.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleContentWarningChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const warning = e.target.value;
    const isChecked = e.target.checked;

    setSelectedContentWarnings((prev) => {
      if (isChecked) {
        return [...prev, warning];
      } else {
        return prev.filter((w) => w !== warning);
      }
    });
  };

  const handleOtherContentWarningChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOtherContentWarning(e.target.value);
  };

  // CAPTCHA modal. Shown after "Send!" and before the doodle upload. onErrored
  // is handled WITHOUT reset() so a failing load (e.g. missing site key) can't
  // loop.
  const captchaModal = showCaptcha && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "400px",
        }}
      >
        <h3>Complete CAPTCHA to send</h3>
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          onErrored={handleCaptchaErrored}
          onExpired={handleCaptchaExpired}
        />
        <button
          type="button"
          onClick={() => setShowCaptcha(false)}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // The drawing area for new submissions: the doodle canvas plus a download
  // escape hatch and any upload/CAPTCHA error + retry.
  const doodleSection = (
    <div className="form-group">
      <label>Doodle!</label>

      <DoodleCanvas ref={doodleRef} showExportPreview={false} />

      <div className="doodle__actions">
        <button
          type="button"
          onClick={handleDownloadDoodle}
          className="doodle__tool"
          disabled={submitting || uploading}
        >
          Download doodle
        </button>
        {uploadError && pendingImagesRef.current && !uploading && (
          <button
            type="button"
            onClick={handleRetryCaptcha}
            className="doodle__tool doodle__tool--primary"
            disabled={submitting}
          >
            Retry CAPTCHA
          </button>
        )}
      </div>

      {uploading && <p className="doodle__status">Sending…</p>}
      {uploadError && !uploading && (
        <p className="doodle__status doodle__status--error">{uploadError}</p>
      )}
    </div>
  );

  // Edit mode: art shown read-only (can't be changed), other fields editable.
  const readOnlyArtSection = (
    <div className="form-group">
      <label>Art (can't be changed)</label>
      {fanArtForm.full_image ? (
        <img
          src={fanArtForm.full_image}
          alt="Fan art"
          style={{
            maxWidth: "100%",
            maxHeight: "300px",
            display: "block",
            border: "2px solid #ddd",
            borderRadius: "4px",
          }}
        />
      ) : (
        <p style={{ fontSize: "14px", color: "#555" }}>No image.</p>
      )}
    </div>
  );

  // Shared fields (name, caption, content warning, password) rendered after the
  // art section. `password` is only shown for new submissions.
  const sharedFields = (
    <>
      <div className="form-group">
        <label htmlFor="fanart-caption">Caption (optional)</label>
        <input
          type="text"
          id="fanart-caption"
          name="caption"
          value={fanArtForm.caption}
          onChange={handleFanArtInputChange}
        />
      </div>

      <div className="form-group">
        <label>Content warning (optional)</label>
        <div className="content-warning-checkboxes">
          {CONTENT_WARNINGS.map((warning, index) => {
            const checkboxId = `content-warning-${index}`;
            return (
              <div key={index}>
                <input
                  id={checkboxId}
                  type="checkbox"
                  value={warning}
                  checked={selectedContentWarnings.includes(warning)}
                  onChange={handleContentWarningChange}
                />
                <label htmlFor={checkboxId}>{warning}</label>
              </div>
            );
          })}
          <div className="checkbox-label">
            <input
              id="content-warning-other"
              type="checkbox"
              value="Other"
              checked={selectedContentWarnings.includes("Other")}
              onChange={handleContentWarningChange}
            />
            <label htmlFor="content-warning-other">Other</label>
          </div>
        </div>
      </div>

      <div className="form-group">
        {selectedContentWarnings.includes("Other") && (
          <input
            type="text"
            placeholder="Specify other content warning..."
            value={otherContentWarning}
            onChange={handleOtherContentWarningChange}
          />
        )}
      </div>

      {!isEditMode && (
        <div className="form-group">
          <label htmlFor="fanart-password">
            Password (for edit/delete later, optional!)
          </label>
          <input
            type="text"
            id="fanart-password"
            name="password"
            value={fanArtForm.password}
            onChange={handleFanArtInputChange}
            placeholder="*don't set me as 123456 :)*"
          />
        </div>
      )}
    </>
  );

  const successBanner = showSuccessMessage && (
    <div
      className="success-message"
      style={{
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
        borderRadius: "4px",
        textAlign: "center",
        fontSize: "14px",
      }}
    >
      ✓ {isEditMode ? "Art updated!" : "Art sent!"}
    </div>
  );

  // In edit mode, render the form directly without the toggle container.
  if (isEditMode) {
    return (
      <form
        onSubmit={handleEditSubmit}
        className="div-3d-with-shadow guest-book-form"
      >
        <div className="form-group">
          <label htmlFor="fanart-name">Display name (optional)</label>
          <input
            type="text"
            id="fanart-name"
            name="name"
            value={fanArtForm.name}
            onChange={handleFanArtInputChange}
          />
        </div>

        {readOnlyArtSection}
        {sharedFields}

        <div className="form-actions">
          {onCancel && (
            <ButtonWrapper
              onClick={onCancel}
              disabled={submitting}
              className="cancel-button"
              type="button"
            >
              Cancel
            </ButtonWrapper>
          )}
          <ButtonWrapper
            type="submit"
            onClick={() => {}}
            disabled={submitting}
            className="submit-button"
          >
            {submitting ? "Updating..." : "Update"}
          </ButtonWrapper>
        </div>

        {successBanner}
      </form>
    );
  }

  // Normal mode with toggle button and container.
  return (
    <div className="form-container fanart-form-container">
      <ButtonWrapper
        className="form-toggle-button"
        onClick={onToggle}
        soundFile={buttonSoundGallery}
      >
        <img src={buttonSendArt} alt="Send" className="div-3d-with-shadow" />
      </ButtonWrapper>
      {showForm && (
        <form
          onSubmit={handleFanArtSubmit}
          className="div-3d-with-shadow guest-book-form"
        >
          <div className="form-group">
            <label htmlFor="fanart-name">Display name (optional)</label>
            <input
              type="text"
              id="fanart-name"
              name="name"
              value={fanArtForm.name}
              onChange={handleFanArtInputChange}
            />
          </div>

          {doodleSection}
          {sharedFields}

          <div>
            <ButtonWrapper
              type="submit"
              onClick={() => {}}
              disabled={submitting || uploading}
              className="submit-button"
            >
              {submitting || uploading ? "Sending..." : "Send!"}
            </ButtonWrapper>
          </div>

          {successBanner}
        </form>
      )}

      {captchaModal}
    </div>
  );
};

export default GuestBookFanArtForm;
