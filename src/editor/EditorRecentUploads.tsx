import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { apiBaseUrl } from "../helpers/constants";
import "./EditorCommon.css";

interface EditorRecentUploadsProps {
    apiKey: string;
    type: "image" | "audio";
}

export const EditorRecentUploads: React.FC<EditorRecentUploadsProps> = ({
    apiKey,
    type,
}) => {
    const [recentItems, setRecentItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPlayingAudio, setCurrentPlayingAudio] =
        useState<HTMLAudioElement | null>(null);

    const loadRecentUploads = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter the API key first");
            return;
        }

        setLoading(true);

        try {
            // For images, we want thumbnails by default for the list
            // For audio, we just request audio type
            const requestType = type === "image" ? "thumbnail" : "audio";

            const response = await fetch(
                `${apiBaseUrl}/uploads/recent?type=${requestType}&limit=20`,
                {
                    method: "GET",
                    headers: {
                        "X-API-Key": apiKey,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch recent uploads");
            }

            const data = await response.json();
            setRecentItems(data.urls || []);
            toast.success(
                `Loaded ${data.urls?.length || 0} recent ${type} files`
            );
        } catch (error) {
            console.error("Error fetching recent uploads:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch recent uploads"
            );
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    const playAudio = (url: string) => {
        // Stop currently playing audio if any
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
        }

        // Create a new audio element to play the sound
        const audio = new Audio(url);

        // Set up event listeners
        audio.addEventListener("ended", () => {
            setCurrentPlayingAudio(null);
        });

        audio.addEventListener("error", (error) => {
            console.error("Error playing audio:", error);
            toast.error("Failed to play audio");
            setCurrentPlayingAudio(null);
        });

        // Play the audio
        audio
            .play()
            .then(() => {
                setCurrentPlayingAudio(audio);
            })
            .catch((error) => {
                console.error("Error playing audio:", error);
                toast.error("Failed to play audio");
            });
    };

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            if (currentPlayingAudio) {
                currentPlayingAudio.pause();
                currentPlayingAudio.currentTime = 0;
            }
        };
    }, [currentPlayingAudio]);

    return (
        <div className="editor-section">
            <div className="editor-section-header">
                <h3>
                    Recent Server Uploads ({recentItems.length})
                </h3>
                <button
                    onClick={loadRecentUploads}
                    disabled={!apiKey.trim() || loading}
                    className="editor-button editor-button-secondary editor-button-small"
                >
                    {loading ? (
                        <>
                            <div
                                className="editor-loading-spinner"
                                style={{ width: "14px", height: "14px" }}
                            />
                            Loading...
                        </>
                    ) : (
                        "Refresh"
                    )}
                </button>
            </div>
            <div
                className="editor-list"
                style={{ maxHeight: "400px", overflowY: "auto" }}
            >
                {recentItems.length === 0 ? (
                    <p
                        style={{
                            color: "var(--editor-gray-600)",
                            textAlign: "center",
                            padding: "var(--editor-spacing-md)",
                        }}
                    >
                        {apiKey.trim()
                            ? "Click refresh to load recent uploads"
                            : "Enter Sam password and click refresh to load recent uploads"}
                    </p>
                ) : (
                    recentItems.map((url, index) => {
                        const filename = url.split("/").pop() || `${type}-${index + 1}`;

                        // For images, construct full URL from thumbnail URL
                        const fullUrl = type === "image"
                            ? url.replace("/thumbnails/", "/full/")
                            : url;

                        return (
                            <div
                                key={url}
                                className="editor-item"
                                style={{ padding: "var(--editor-spacing-sm)" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--editor-spacing-sm)",
                                        width: "100%",
                                    }}
                                >
                                    {type === "image" ? (
                                        <img
                                            src={url}
                                            alt="Recent upload"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                borderRadius: "var(--editor-border-radius)",
                                                border: "1px solid var(--editor-gray-300)",
                                            }}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => playAudio(url)}
                                            className="editor-button editor-button-secondary"
                                            style={{
                                                padding: "var(--editor-spacing-xs)",
                                                minWidth: "auto",
                                                flexShrink: 0,
                                            }}
                                            title="Play audio"
                                        >
                                            ▶️
                                        </button>
                                    )}

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontWeight: 500,
                                                fontSize: "14px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {filename}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "0.75rem",
                                                color: "var(--editor-gray-600)",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {url}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "4px",
                                        }}
                                    >
                                        {type === "image" ? (
                                            <button
                                                onClick={() => copyToClipboard(fullUrl, "Full Image URL")}
                                                className="editor-button editor-button-secondary editor-button-small"
                                            >
                                                Copy Link
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => copyToClipboard(url, "Audio URL")}
                                                className="editor-button editor-button-secondary editor-button-small"
                                            >
                                                Copy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
