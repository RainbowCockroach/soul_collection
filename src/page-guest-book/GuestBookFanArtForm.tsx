import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import useSound from "use-sound";
import ButtonWrapper from "../common-components/ButtonWrapper";
import type { MessageContent } from "./types";
import { apiBaseUrl, SUCCESS_MESSAGE_DURATION_MS } from "../helpers/constants";
import buttonSound from "/sound-effect/button_gallery_item.mp3";
import buttonSoundHover from "/sound-effect/button_hover.mp3";

interface GuestBookFanArtFormProps {
  onSubmit: (
    messageContent: MessageContent,
    type: "note" | "fan art",
    password?: string | null,
    captchaToken?: string,
  ) => Promise<void>;
  submitting?: boolean;
  // Called after a successful (non-edit) submission — used to clear the canvas
  // and close the dialog.
  onSuccess?: () => void;
  // New submissions: the PNG exported from the page's doodle canvas. Used for
  // the preview and, on submit, as the source of the uploaded image.
  imageDataUrl?: string;
  // Edit mode props
  isEditMode?: boolean;
  initialData?: {
    name?: string;
    thumbnail?: string;
    full_image?: string;
    caption?: string;
  };
  onCancel?: () => void;
}

/** Convert a base64 data URL into a Blob (used for the exported doodle PNG). */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

const GuestBookFanArtForm = ({
  onSubmit,
  submitting = false,
  onSuccess,
  imageDataUrl,
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
    }
  }, [isEditMode, initialData]);

  // Upload state (new submissions only).
  // Exported doodle file held between "Send!" and CAPTCHA solve so a failed
  // CAPTCHA can be retried without re-exporting.
  const pendingImageRef = useRef<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // CAPTCHA state. The token itself is passed directly to uploadAndSubmit
  // rather than kept in state, so we never read a stale (single-use) token.
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const [playClick] = useSound(buttonSound, { volume: 0.5 });

  const handleFanArtInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFanArtForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    };
    try {
      await onSubmit(messageContent, "fan art", fanArtForm.password || null);
      flashSuccess();
    } catch {
      // Parent handles the error; don't show success.
    }
  };

  // New submission: prepare the exported PNG, then require a CAPTCHA before
  // uploading. The PNG comes from the page's doodle canvas via imageDataUrl.
  const handleFanArtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!imageDataUrl) {
      setUploadError("No drawing to send.");
      return;
    }

    try {
      const fullBlob = await dataUrlToBlob(imageDataUrl);
      const fullFile = new File([fullBlob], "doodle.png", {
        type: "image/png",
      });
      pendingImageRef.current = fullFile;
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not prepare your doodle",
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
    if (pendingImageRef.current) {
      uploadAndSubmit(pendingImageRef.current, token);
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
    if (!pendingImageRef.current) return;
    playClick();
    setUploadError(null);
    captchaRef.current?.reset();
    setShowCaptcha(true);
  };

  // Upload the exported doodle then create the message. The backend runs
  // smartcrop on the full image to generate a square (1:1) thumbnail, so the
  // frontend only needs to send the drawing as-is.
  const uploadAndSubmit = async (fullFile: File, token: string) => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("image", fullFile);
      formData.append("captchaToken", token);

      const response = await fetch(`${apiBaseUrl}/upload/image-guest`, {
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
      };

      await onSubmit(messageContent, "fan art", fanArtForm.password || null);

      // Discord notification is sent server-side on message creation.
      pendingImageRef.current = null;
      flashSuccess();
      // Let the parent clear the canvas and close the dialog.
      onSuccess?.();
    } catch (err) {
      // Keep pendingImageRef so the user can retry the CAPTCHA or download the
      // doodle — a failed attempt never loses their drawing.
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload doodle",
      );
    } finally {
      setUploading(false);
    }
  };

  // Let the user save their unsubmitted doodle (e.g. if the CAPTCHA fails).
  const handleDownloadDoodle = () => {
    if (!imageDataUrl) return;
    playClick();
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = "doodle.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // CAPTCHA modal. Shown after "Send!" and before the doodle upload. onErrored
  // is handled WITHOUT reset() so a failing load (e.g. missing site key) can't
  // loop.
  const captchaModal = showCaptcha && (
    <div className="gb-captcha-overlay">
      <div className="gb-captcha-card">
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
          onClick={() => {
            playClick();
            setShowCaptcha(false);
          }}
          className="gb-captcha-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // New submissions: preview the exported doodle plus a download escape hatch
  // and any upload/CAPTCHA error + retry.
  const doodlePreviewSection = (
    <div className="form-group">
      <label>Your doodle</label>
      {imageDataUrl ? (
        <img
          src={imageDataUrl}
          alt="Your doodle"
          className="fanart-doodle-preview"
        />
      ) : (
        <p style={{ fontSize: "14px", color: "#555" }}>No drawing.</p>
      )}

      <div className="doodle__actions">
        <button
          type="button"
          onClick={handleDownloadDoodle}
          className="doodle__tool"
          disabled={submitting || uploading || !imageDataUrl}
        >
          Download doodle
        </button>
        {uploadError && pendingImageRef.current && !uploading && (
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
          alt="Drawing"
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

  // Shared fields (name, caption, password) rendered after the art section.
  // `password` is only shown for new submissions.
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
    <div className="gb-success-banner">
      ✓ {isEditMode ? "Art updated!" : "Art sent!"}
    </div>
  );

  // Edit mode: art shown read-only, other fields editable.
  if (isEditMode) {
    return (
      <form onSubmit={handleEditSubmit} className="guest-book-form">
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
              soundFile={buttonSound}
              hoverSoundFile={buttonSoundHover}
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
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
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

  // New submission (dialog): preview the doodle, fill in details, then send.
  return (
    <>
      <form onSubmit={handleFanArtSubmit} className="guest-book-form">
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

        {doodlePreviewSection}
        {sharedFields}

        <div className="form-actions">
          {onCancel && (
            <ButtonWrapper
              onClick={onCancel}
              soundFile={buttonSound}
              hoverSoundFile={buttonSoundHover}
              disabled={submitting || uploading}
              className="cancel-button"
              type="button"
            >
              Cancel
            </ButtonWrapper>
          )}
          <ButtonWrapper
            type="submit"
            onClick={() => {}}
            soundFile={buttonSound}
            hoverSoundFile={buttonSoundHover}
            disabled={submitting || uploading || !imageDataUrl}
            className="submit-button"
          >
            {submitting || uploading ? "Sending..." : "Send!"}
          </ButtonWrapper>
        </div>

        {successBanner}
      </form>

      {captchaModal}
    </>
  );
};

export default GuestBookFanArtForm;
