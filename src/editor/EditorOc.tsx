import React, { useState, useEffect } from "react";
import type {
  OC,
  Group,
  Spieces,
  BreadcrumbItem,
  GalleryItem,
  Tag,
} from "../helpers/objects";
import {
  loadOCs,
  loadGroups,
  loadSpecies,
  loadTags,
} from "../helpers/data-load";
import { SCEditor } from "./BBCodeEditor";

const BBCODE_TOOLBAR = "bold,italic,underline,strike|color|image,link|source";
const BBCODE_TOOLBAR_MINIMAL = "image|source";
import ImagePreview from "./ImagePreview";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ReorderButtons from "./ReorderButtons";
import { arrayMove } from "./reorder-utils";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import CollapsibleWrapper from "../common-components/CollapsibleWrapper";
import {
  parseContentWarning,
  buildContentWarning,
} from "../helpers/content-warning";

interface OcJsonData {
  [key: string]: Omit<OC, "slug">;
}

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface SpiecesJsonData {
  [key: string]: Omit<Spieces, "slug">;
}

interface OcListItemProps {
  oc: OC;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
  onMove: (from: number, to: number) => void;
}

const OcListItem: React.FC<OcListItemProps> = ({
  oc,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => {
  return (
    <div className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}>
      <ReorderButtons index={index} total={total} onMoveTo={onMove} />
      <div onClick={() => onSelect(oc.slug)} className="editor-item-content">
        <img
          src={oc.avatar?.[0] || "https://placehold.co/40"}
          alt={oc.name}
          className="editor-avatar"
        />
        <span>
          <BBCodeDisplay bbcode={oc.name} /> ({oc.slug})
        </span>
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteButton onClick={() => onDelete(oc.slug)} title="Delete OC" />
      </span>
    </div>
  );
};

export const EditorOc: React.FC = () => {
  const [ocData, setOcData] = useState<OcJsonData>({});
  const [ocsArray, setOcsArray] = useState<OC[]>([]);
  const [groupData, setGroupData] = useState<GroupJsonData>({});
  const [spiecesData, setSpiecesData] = useState<SpiecesJsonData>({});
  const [tagsArray, setTagsArray] = useState<Tag[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<OC | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ocsArray, groupsArray, speciesArray, tagsArray] =
        await Promise.all([loadOCs(), loadGroups(), loadSpecies(), loadTags()]);

      const ocData: OcJsonData = {};
      const groupData: GroupJsonData = {};
      const spiecesData: SpiecesJsonData = {};

      ocsArray.forEach((oc, index) => {
        const { slug, ...rest } = oc;
        ocData[slug] = { ...rest, order: rest.order ?? index };
      });

      groupsArray.forEach((group) => {
        const { slug, ...rest } = group;
        groupData[slug] = rest;
      });

      speciesArray.forEach((species) => {
        const { slug, ...rest } = species;
        spiecesData[slug] = rest;
      });

      setOcData(ocData);
      setOcsArray(
        ocsArray.map((oc, index) => ({
          ...oc,
          order: oc.order ?? index,
        })),
      );
      setGroupData(groupData);
      setSpiecesData(spiecesData);
      setTagsArray(tagsArray);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSelectItem = (slug: string) => {
    setSelectedSlug(slug);
    setEditingItem({ ...ocData[slug], slug });
    setIsEditing(true);
  };

  const isNewItem = () => {
    return editingItem && !ocData[editingItem.slug];
  };

  const handleMoveOc = (from: number, to: number) => {
    const newOcsArray = arrayMove(ocsArray, from, to);
    if (newOcsArray === ocsArray) return;

    const updatedOcsArray = newOcsArray.map((oc, idx) => ({
      ...oc,
      order: idx,
    }));

    setOcsArray(updatedOcsArray);

    const updatedData: OcJsonData = {};
    updatedOcsArray.forEach((oc) => {
      const { slug, ...rest } = oc;
      updatedData[slug] = rest;
    });
    setOcData(updatedData);
  };

  const handleMoveBreadcrumb = (from: number, to: number) => {
    if (!editingItem) return;
    const newBreadcrumbs = arrayMove(editingItem.breadcrumbs, from, to);
    if (newBreadcrumbs === editingItem.breadcrumbs) return;
    setEditingItem({ ...editingItem, breadcrumbs: newBreadcrumbs });
  };

  const handleMoveGallery = (from: number, to: number) => {
    if (!editingItem) return;
    const newGallery = arrayMove(editingItem.gallery, from, to);
    if (newGallery === editingItem.gallery) return;
    setEditingItem({ ...editingItem, gallery: newGallery });
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...ocData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    const updatedOcsArray = ocsArray.map((oc) =>
      oc.slug === slug ? editingItem : oc,
    );
    if (!ocsArray.find((oc) => oc.slug === slug)) {
      updatedOcsArray.push(editingItem);
    }

    setOcData(updatedData);
    setOcsArray(updatedOcsArray);
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
    toast.success("OC updated! Use 'Copy to clipboard' to export.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setSelectedSlug("");
  };

  const handleAddNew = () => {
    const ocName = prompt("Enter name for new OC:");
    if (ocName) {
      const newSlug = slugify(ocName, { lower: true, strict: true });
      if (!ocData[newSlug]) {
        setEditingItem({
          slug: newSlug,
          name: ocName,
          avatar: [],
          group: [],
          spieces: [],
          info: "",
          gallery: [],
          breadcrumbs: [],
          tags: [],
          order: ocsArray.length,
        });
        setSelectedSlug(newSlug);
        setIsEditing(true);
      } else {
        toast.error("An OC with this name already exists!");
      }
    }
  };

  const handleDelete = (slug: string) => {
    if (confirm(`Are you sure you want to delete OC "${ocData[slug].name}"?`)) {
      const updatedData = { ...ocData };
      delete updatedData[slug];

      const updatedOcsArray = ocsArray.filter((oc) => oc.slug !== slug);

      setOcData(updatedData);
      setOcsArray(updatedOcsArray);
      if (selectedSlug === slug) {
        setIsEditing(false);
        setEditingItem(null);
        setSelectedSlug("");
      }
      toast.success("OC deleted! Use 'Copy to clipboard' to export.");
    }
  };

  const handleGroupToggle = (groupSlug: string) => {
    if (!editingItem) return;

    const updatedGroups = editingItem.group.includes(groupSlug)
      ? editingItem.group.filter((g) => g !== groupSlug)
      : [...editingItem.group, groupSlug];

    setEditingItem({ ...editingItem, group: updatedGroups });
  };

  const handleSpeciesToggle = (spiecesSlug: string) => {
    if (!editingItem) return;

    const updatedSpecies = editingItem.spieces.includes(spiecesSlug)
      ? editingItem.spieces.filter((s) => s !== spiecesSlug)
      : [...editingItem.spieces, spiecesSlug];

    setEditingItem({ ...editingItem, spieces: updatedSpecies });
  };

  const handleArrayFieldChange = (
    field: "tags",
    index: number,
    value: string,
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleGalleryFieldChange = (
    index: number,
    field: "image" | "thumbnail" | "caption" | "contentWarning",
    value: string,
  ) => {
    if (!editingItem) return;

    const updatedGallery = [...editingItem.gallery];
    updatedGallery[index] = { ...updatedGallery[index], [field]: value };
    setEditingItem({ ...editingItem, gallery: updatedGallery });
  };

  const handleAddArrayItem = (field: "tags") => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field], ""];
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleRemoveArrayItem = (field: "tags", index: number) => {
    if (!editingItem) return;

    const updatedArray = editingItem[field].filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleAddGalleryItem = () => {
    if (!editingItem) return;

    const newGalleryItem: GalleryItem = {
      image: "",
      thumbnail: "",
      caption: "",
      contentWarning: "",
    };
    const updatedGallery = [...editingItem.gallery, newGalleryItem];
    setEditingItem({ ...editingItem, gallery: updatedGallery });
  };

  const handleRemoveGalleryItem = (index: number) => {
    if (!editingItem) return;

    const updatedGallery = editingItem.gallery.filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, gallery: updatedGallery });
  };

  const handleBreadcrumbChange = (
    index: number,
    field: "title" | "description" | "video" | "contentWarning" | "images",
    value: string | string[],
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    if (field === "title") {
      updatedBreadcrumbs[index] = {
        ...updatedBreadcrumbs[index],
        title: value as string,
      };
    } else if (field === "description") {
      updatedBreadcrumbs[index] = {
        ...updatedBreadcrumbs[index],
        description: value as string,
      };
    } else if (field === "video") {
      updatedBreadcrumbs[index] = {
        ...updatedBreadcrumbs[index],
        video: value as string,
      };
    } else if (field === "contentWarning") {
      updatedBreadcrumbs[index] = {
        ...updatedBreadcrumbs[index],
        contentWarning: value as string,
      };
    } else {
      updatedBreadcrumbs[index] = {
        ...updatedBreadcrumbs[index],
        images: value as string[],
      };
    }
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleBreadcrumbImageChange = (
    breadcrumbIndex: number,
    imageIndex: number,
    value: string,
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    const updatedImages = [
      ...(updatedBreadcrumbs[breadcrumbIndex].images || []),
    ];
    updatedImages[imageIndex] = value;
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: updatedImages,
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleAddBreadcrumbImage = (breadcrumbIndex: number) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: [...(updatedBreadcrumbs[breadcrumbIndex].images || []), ""],
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleRemoveBreadcrumbImage = (
    breadcrumbIndex: number,
    imageIndex: number,
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: (updatedBreadcrumbs[breadcrumbIndex].images || []).filter(
        (_, i) => i !== imageIndex,
      ),
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleAddBreadcrumb = () => {
    if (!editingItem) return;

    const newBreadcrumb: BreadcrumbItem = {
      title: "",
      images: [],
      video: "",
      description: "",
      contentWarning: "",
    };
    setEditingItem({
      ...editingItem,
      breadcrumbs: [...editingItem.breadcrumbs, newBreadcrumb],
    });
  };

  const handleRemoveBreadcrumb = (index: number) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = editingItem.breadcrumbs.filter(
      (_, i) => i !== index,
    );
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton fileId="oc" getData={() => ocData} />
          <CopyToClipboardButton getData={() => ocData} entityLabel="OC JSON" />
        </div>
      </div>

      <div className="editor-button-group">
        <button
          onClick={handleAddNew}
          className="editor-button editor-button-primary"
        >
          Add New OC
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>OC List</h3>
            </div>
            <div className="editor-list">
              {ocsArray.map((oc, index) => (
                <OcListItem
                  key={oc.slug}
                  oc={oc}
                  index={index}
                  total={ocsArray.length}
                  isSelected={selectedSlug === oc.slug}
                  onSelect={handleSelectItem}
                  onDelete={handleDelete}
                  onMove={handleMoveOc}
                />
              ))}
            </div>
          </div>
        </div>

        {isEditing && editingItem && (
          <div className="editor-right">
            <div className="editor-form">
              <div className="editor-field">
                <label className="editor-label">URL Name:</label>
                <input
                  type="text"
                  value={editingItem.slug}
                  onChange={(e) => {
                    if (isNewItem()) {
                      setEditingItem({
                        ...editingItem,
                        slug: slugify(e.target.value, {
                          lower: true,
                          strict: true,
                        }),
                      });
                    }
                  }}
                  className="editor-input"
                  disabled={!isNewItem()}
                />
                {!isNewItem() && (
                  <small className="editor-text-muted">
                    URL names cannot be changed for existing OCs to prevent data
                    corruption
                  </small>
                )}
              </div>

              <div className="editor-field">
                <label className="editor-label">Name:</label>
                <SCEditor
                  format="bbcode"
                  toolbar={BBCODE_TOOLBAR_MINIMAL}
                  value={editingItem.name}
                  onChange={(value) => {
                    const newName = value;
                    if (isNewItem()) {
                      const newSlug = slugify(newName, {
                        lower: true,
                        strict: true,
                      });
                      setEditingItem({
                        ...editingItem,
                        name: newName,
                        slug: newSlug,
                      });
                    } else {
                      setEditingItem({ ...editingItem, name: newName });
                    }
                  }}
                  height={100}
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Avatar URLs:</label>
                {editingItem.avatar.map((avatarUrl, index) => (
                  <div key={index} className="editor-array-item">
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => {
                        const newAvatars = [...editingItem.avatar];
                        newAvatars[index] = e.target.value;
                        setEditingItem({ ...editingItem, avatar: newAvatars });
                      }}
                      className="editor-array-input"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <DeleteButton
                      onClick={() => {
                        const newAvatars = editingItem.avatar.filter(
                          (_, i) => i !== index,
                        );
                        setEditingItem({ ...editingItem, avatar: newAvatars });
                      }}
                      title="Remove avatar"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newAvatars = [...editingItem.avatar, ""];
                    setEditingItem({ ...editingItem, avatar: newAvatars });
                  }}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Avatar
                </button>
                <ImagePreview urls={editingItem.avatar} />
              </div>

              <div className="editor-field">
                <label className="editor-label">
                  Voice Sample URL (Optional):
                </label>
                <input
                  type="text"
                  value={editingItem.voiceSample || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      voiceSample: e.target.value || undefined,
                    })
                  }
                  className="editor-input"
                  placeholder="https://example.com/voice-sample.mp3"
                />
                <small className="editor-text-muted">
                  Paste a direct URL to an audio file (MP3, OGG, WAV, etc.)
                </small>
              </div>

              <div className="editor-field">
                <label className="editor-label">Groups:</label>
                <div className="editor-checkbox-group">
                  {Object.entries(groupData).map(([slug, group]) => (
                    <div key={slug} className="editor-checkbox-item">
                      <label className="editor-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingItem.group.includes(slug)}
                          onChange={() => handleGroupToggle(slug)}
                        />
                        <div
                          className="editor-color-box"
                          style={{ backgroundColor: group.frameColour }}
                        />
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">Species:</label>
                <div className="editor-checkbox-group">
                  {Object.entries(spiecesData).map(([slug, species]) => (
                    <div key={slug} className="editor-checkbox-item">
                      <label className="editor-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingItem.spieces.includes(slug)}
                          onChange={() => handleSpeciesToggle(slug)}
                        />
                        {species.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-field">
                <label className="editor-label">Info:</label>
                <SCEditor
                  format="bbcode"
                  toolbar={BBCODE_TOOLBAR}
                  value={editingItem.info}
                  onChange={(value) =>
                    setEditingItem({ ...editingItem, info: value })
                  }
                  height={200}
                />
              </div>

              <div className="editor-field">
                <label className="editor-label">Gallery:</label>
                {editingItem.gallery.map((galleryItem, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      gap: "8px",
                    }}
                  >
                    <ReorderButtons
                      index={index}
                      total={editingItem.gallery.length}
                      onMoveTo={handleMoveGallery}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <CollapsibleWrapper
                        button={
                          <>
                            Image {index + 1}
                            {galleryItem.caption && (
                              <>
                                {" - "}
                                <BBCodeDisplay bbcode={galleryItem.caption} />
                              </>
                            )}
                          </>
                        }
                        buttonClassName="editor-collapsible-button"
                        container={
                          <div key={index} className="editor-section">
                            <div className="editor-section-header">
                              <h4>Gallery Item {index + 1}</h4>
                              <DeleteButton
                                onClick={() => handleRemoveGalleryItem(index)}
                                title="Remove gallery item"
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">Image URL:</label>
                              <input
                                type="text"
                                value={galleryItem.image}
                                onChange={(e) =>
                                  handleGalleryFieldChange(
                                    index,
                                    "image",
                                    e.target.value,
                                  )
                                }
                                className="editor-input"
                                placeholder="Image URL"
                              />
                              <ImagePreview urls={[galleryItem.image]} />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">
                                Thumbnail URL:
                              </label>
                              <input
                                type="text"
                                value={galleryItem.thumbnail || ""}
                                onChange={(e) =>
                                  handleGalleryFieldChange(
                                    index,
                                    "thumbnail",
                                    e.target.value,
                                  )
                                }
                                className="editor-input"
                                placeholder="Thumbnail URL (optional)"
                              />
                              <ImagePreview
                                urls={[galleryItem.thumbnail || ""]}
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">Caption:</label>
                              <SCEditor
                                format="bbcode"
                                toolbar={BBCODE_TOOLBAR_MINIMAL}
                                value={galleryItem.caption || ""}
                                onChange={(value) =>
                                  handleGalleryFieldChange(
                                    index,
                                    "caption",
                                    value,
                                  )
                                }
                                height={100}
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">
                                Content Warning:
                              </label>
                              <div className="editor-input-with-button">
                                <input
                                  type="text"
                                  value={
                                    galleryItem.contentWarning
                                      ? parseContentWarning(
                                          galleryItem.contentWarning,
                                        ).text
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const safeOnly = galleryItem.contentWarning
                                      ? parseContentWarning(
                                          galleryItem.contentWarning,
                                        ).safeOnly
                                      : false;
                                    handleGalleryFieldChange(
                                      index,
                                      "contentWarning",
                                      e.target.value
                                        ? buildContentWarning(
                                            e.target.value,
                                            safeOnly,
                                          )
                                        : "",
                                    );
                                  }}
                                  className="editor-input"
                                  placeholder="Content warning (optional)"
                                />
                                <button
                                  type="button"
                                  className={`editor-button editor-button-small ${
                                    galleryItem.contentWarning &&
                                    parseContentWarning(
                                      galleryItem.contentWarning,
                                    ).safeOnly
                                      ? "editor-button-toggle-active"
                                      : "editor-button-secondary"
                                  }`}
                                  title="Toggle: show warning only in safe mode"
                                  onClick={() => {
                                    const raw =
                                      galleryItem.contentWarning || "";
                                    const { text, safeOnly } =
                                      parseContentWarning(raw);
                                    if (text) {
                                      handleGalleryFieldChange(
                                        index,
                                        "contentWarning",
                                        buildContentWarning(text, !safeOnly),
                                      );
                                    }
                                  }}
                                >
                                  {galleryItem.contentWarning &&
                                  parseContentWarning(
                                    galleryItem.contentWarning,
                                  ).safeOnly
                                    ? "🛡️ Safe only"
                                    : "🌶️ Both modes"}
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddGalleryItem}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Gallery Item
                </button>
              </div>

              <div className="editor-field">
                <label className="editor-label">Breadcrumbs:</label>
                {editingItem.breadcrumbs.map((breadcrumb, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      gap: "8px",
                    }}
                  >
                    <ReorderButtons
                      index={index}
                      total={editingItem.breadcrumbs.length}
                      onMoveTo={handleMoveBreadcrumb}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <CollapsibleWrapper
                        button={
                          <>
                            Breadcrumb {index + 1}
                            {breadcrumb.title && ` - ${breadcrumb.title}`}
                          </>
                        }
                        buttonClassName="editor-collapsible-button"
                        container={
                          <div className="editor-section">
                            <div className="editor-section-header">
                              <h4>Breadcrumb {index + 1}</h4>
                              <DeleteButton
                                onClick={() => handleRemoveBreadcrumb(index)}
                                title="Remove breadcrumb"
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">Title:</label>
                              <SCEditor
                                format="bbcode"
                                toolbar={BBCODE_TOOLBAR_MINIMAL}
                                value={breadcrumb.title || ""}
                                onChange={(value) =>
                                  handleBreadcrumbChange(index, "title", value)
                                }
                                height={100}
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">
                                Description:
                              </label>
                              <SCEditor
                                format="bbcode"
                                toolbar={BBCODE_TOOLBAR}
                                value={breadcrumb.description}
                                onChange={(value) =>
                                  handleBreadcrumbChange(
                                    index,
                                    "description",
                                    value,
                                  )
                                }
                                height={150}
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">
                                YouTube Video Embed:
                              </label>
                              <textarea
                                value={breadcrumb.video || ""}
                                onChange={(e) =>
                                  handleBreadcrumbChange(
                                    index,
                                    "video",
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="editor-textarea"
                                placeholder="Paste YouTube iframe embed code here"
                              />
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">
                                Content Warning:
                              </label>
                              <div className="editor-input-with-button">
                                <input
                                  type="text"
                                  value={
                                    breadcrumb.contentWarning
                                      ? parseContentWarning(
                                          breadcrumb.contentWarning,
                                        ).text
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const safeOnly = breadcrumb.contentWarning
                                      ? parseContentWarning(
                                          breadcrumb.contentWarning,
                                        ).safeOnly
                                      : false;
                                    handleBreadcrumbChange(
                                      index,
                                      "contentWarning",
                                      e.target.value
                                        ? buildContentWarning(
                                            e.target.value,
                                            safeOnly,
                                          )
                                        : "",
                                    );
                                  }}
                                  className="editor-input"
                                  placeholder="Content warning for breadcrumb images (optional)"
                                />
                                <button
                                  type="button"
                                  className={`editor-button editor-button-small ${
                                    breadcrumb.contentWarning &&
                                    parseContentWarning(
                                      breadcrumb.contentWarning,
                                    ).safeOnly
                                      ? "editor-button-toggle-active"
                                      : "editor-button-secondary"
                                  }`}
                                  title="Toggle: show warning only in safe mode"
                                  onClick={() => {
                                    const raw = breadcrumb.contentWarning || "";
                                    const { text, safeOnly } =
                                      parseContentWarning(raw);
                                    if (text) {
                                      handleBreadcrumbChange(
                                        index,
                                        "contentWarning",
                                        buildContentWarning(text, !safeOnly),
                                      );
                                    }
                                  }}
                                >
                                  {breadcrumb.contentWarning &&
                                  parseContentWarning(breadcrumb.contentWarning)
                                    .safeOnly
                                    ? "🛡️ Safe only"
                                    : "🌶️ Both modes"}
                                </button>
                              </div>
                            </div>

                            <div className="editor-field">
                              <label className="editor-label">Images:</label>
                              {(breadcrumb.images || []).map(
                                (imageUrl, imageIndex) => (
                                  <div
                                    key={imageIndex}
                                    className="editor-array-item"
                                  >
                                    <input
                                      type="text"
                                      value={imageUrl}
                                      onChange={(e) =>
                                        handleBreadcrumbImageChange(
                                          index,
                                          imageIndex,
                                          e.target.value,
                                        )
                                      }
                                      className="editor-array-input"
                                      placeholder="Image URL"
                                    />
                                    <DeleteButton
                                      onClick={() =>
                                        handleRemoveBreadcrumbImage(
                                          index,
                                          imageIndex,
                                        )
                                      }
                                      title="Remove image"
                                    />
                                  </div>
                                ),
                              )}
                              <button
                                onClick={() => handleAddBreadcrumbImage(index)}
                                className="editor-button editor-button-primary editor-button-small"
                              >
                                Add Image
                              </button>
                              <ImagePreview urls={breadcrumb.images || []} />
                            </div>
                          </div>
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddBreadcrumb}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Breadcrumb
                </button>
              </div>

              <div className="editor-field">
                <label className="editor-label">Tags:</label>
                {editingItem.tags.map((tagSlug, index) => {
                  const tagInfo = tagsArray.find((t) => t.slug === tagSlug);
                  return (
                    <div key={index} className="editor-array-item">
                      <select
                        value={tagSlug}
                        onChange={(e) =>
                          handleArrayFieldChange("tags", index, e.target.value)
                        }
                        className="editor-array-input"
                      >
                        <option value="">Select a tag...</option>
                        {tagsArray.map((tag) => (
                          <option key={tag.slug} value={tag.slug}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                      {tagInfo && (
                        <div
                          className="editor-tag-preview"
                          style={{
                            backgroundColor: tagInfo.backgroundColour,
                            color: tagInfo.textColour,
                          }}
                        >
                          {tagInfo.name}
                        </div>
                      )}
                      <DeleteButton
                        onClick={() => handleRemoveArrayItem("tags", index)}
                        title="Remove tag"
                      />
                    </div>
                  );
                })}
                <button
                  onClick={() => handleAddArrayItem("tags")}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Tag
                </button>
              </div>

              <div className="editor-button-group">
                <button
                  onClick={handleSave}
                  className="editor-button editor-button-success"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
