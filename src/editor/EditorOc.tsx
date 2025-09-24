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
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./EditorCommon.css";
import BBCodeDisplay from "../common-components/BBCodeDisplay";

interface OcJsonData {
  [key: string]: Omit<OC, "slug">;
}

interface GroupJsonData {
  [key: string]: Omit<Group, "slug">;
}

interface SpiecesJsonData {
  [key: string]: Omit<Spieces, "slug">;
}

interface SortableOcItemProps {
  oc: OC;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
}

interface SortableBreadcrumbItemProps {
  breadcrumb: BreadcrumbItem;
  index: number;
  onRemove: (index: number) => void;
  onTitleChange: (index: number, value: string) => void;
  onDescriptionChange: (index: number, value: string) => void;
  onVideoChange: (index: number, value: string) => void;
  onContentWarningChange: (index: number, value: string) => void;
  onImageChange: (
    breadcrumbIndex: number,
    imageIndex: number,
    value: string
  ) => void;
  onAddImage: (breadcrumbIndex: number) => void;
  onRemoveImage: (breadcrumbIndex: number, imageIndex: number) => void;
}

interface SortableGalleryItemProps {
  galleryItem: GalleryItem;
  index: number;
  onRemove: (index: number) => void;
  onImageChange: (index: number, value: string) => void;
  onThumbnailChange: (index: number, value: string) => void;
  onCaptionChange: (index: number, value: string) => void;
  onContentWarningChange: (index: number, value: string) => void;
}

const SortableOcItem: React.FC<SortableOcItemProps> = ({
  oc,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oc.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
    >
      <div className="editor-drag-handle" {...listeners}>
        ⋮⋮
      </div>
      <div onClick={() => onSelect(oc.slug)} className="editor-item-content">
        <img
          src={oc.avatar?.[0] || "https://placehold.co/40"}
          alt={oc.name}
          className="editor-avatar"
        />
        <span>
          <strong>{oc.name}</strong> ({oc.slug})
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(oc.slug);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        Delete
      </button>
    </div>
  );
};

const SortableBreadcrumbItem: React.FC<SortableBreadcrumbItemProps> = ({
  breadcrumb,
  index,
  onRemove,
  onTitleChange,
  onDescriptionChange,
  onVideoChange,
  onContentWarningChange,
  onImageChange,
  onAddImage,
  onRemoveImage,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `breadcrumb-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="editor-section"
    >
      <div className="editor-section-header">
        <div className="editor-drag-handle" {...listeners}>
          ⋮⋮
        </div>
        <h4>Breadcrumb {index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="editor-button editor-button-danger editor-button-small"
        >
          Remove Breadcrumb
        </button>
      </div>

      <div className="editor-field">
        <label className="editor-label">Title:</label>
        <input
          type="text"
          value={breadcrumb.title || ""}
          onChange={(e) => onTitleChange(index, e.target.value)}
          className="editor-input"
          placeholder="Breadcrumb title"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Description:</label>
        <textarea
          value={breadcrumb.description}
          onChange={(e) => onDescriptionChange(index, e.target.value)}
          rows={3}
          className="editor-textarea"
          placeholder="Breadcrumb description"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">YouTube Video Embed:</label>
        <textarea
          value={breadcrumb.video || ""}
          onChange={(e) => onVideoChange(index, e.target.value)}
          rows={3}
          className="editor-textarea"
          placeholder="Paste YouTube iframe embed code here"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Content Warning:</label>
        <input
          type="text"
          value={breadcrumb.contentWarning || ""}
          onChange={(e) => onContentWarningChange(index, e.target.value)}
          className="editor-input"
          placeholder="Content warning for breadcrumb images (optional)"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Images:</label>
        {(breadcrumb.images || []).map((imageUrl, imageIndex) => (
          <div key={imageIndex} className="editor-array-item">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onImageChange(index, imageIndex, e.target.value)}
              className="editor-array-input"
              placeholder="Image URL"
            />
            <button
              onClick={() => onRemoveImage(index, imageIndex)}
              className="editor-button editor-button-danger editor-button-small"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => onAddImage(index)}
          className="editor-button editor-button-primary editor-button-small"
        >
          Add Image
        </button>
      </div>
    </div>
  );
};

const SortableGalleryItem: React.FC<SortableGalleryItemProps> = ({
  galleryItem,
  index,
  onRemove,
  onImageChange,
  onThumbnailChange,
  onCaptionChange,
  onContentWarningChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `gallery-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="editor-section"
    >
      <div className="editor-section-header">
        <div className="editor-drag-handle" {...listeners}>
          ⋮⋮
        </div>
        <h4>Gallery Item {index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="editor-button editor-button-danger editor-button-small"
        >
          Remove
        </button>
      </div>

      <div className="editor-field">
        <label className="editor-label">Image URL:</label>
        <input
          type="text"
          value={galleryItem.image}
          onChange={(e) => onImageChange(index, e.target.value)}
          className="editor-input"
          placeholder="Image URL"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Thumbnail URL:</label>
        <input
          type="text"
          value={galleryItem.thumbnail || ""}
          onChange={(e) => onThumbnailChange(index, e.target.value)}
          className="editor-input"
          placeholder="Thumbnail URL (optional)"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Caption:</label>
        <input
          type="text"
          value={galleryItem.caption || ""}
          onChange={(e) => onCaptionChange(index, e.target.value)}
          className="editor-input"
          placeholder="Caption (optional)"
        />
      </div>

      <div className="editor-field">
        <label className="editor-label">Content Warning:</label>
        <input
          type="text"
          value={galleryItem.contentWarning || ""}
          onChange={(e) => onContentWarningChange(index, e.target.value)}
          className="editor-input"
          placeholder="Content warning (optional)"
        />
      </div>
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
  const [dragMode, setDragMode] = useState(false);
  const [breadcrumbDragMode, setBreadcrumbDragMode] = useState(false);
  const [galleryDragMode, setGalleryDragMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        }))
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = ocsArray.findIndex((oc) => oc.slug === active.id);
      const newIndex = ocsArray.findIndex((oc) => oc.slug === over?.id);

      const newOcsArray = arrayMove(ocsArray, oldIndex, newIndex);

      const updatedOcsArray = newOcsArray.map((oc, index) => ({
        ...oc,
        order: index,
      }));

      setOcsArray(updatedOcsArray);

      const updatedData: OcJsonData = {};
      updatedOcsArray.forEach((oc) => {
        const { slug, ...rest } = oc;
        updatedData[slug] = rest;
      });
      setOcData(updatedData);

      toast.success("OCs reordered! Use 'Copy to clipboard' to export.");
    }
  };

  const handleBreadcrumbDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && editingItem) {
      const activeIndex = parseInt(
        active.id.toString().replace("breadcrumb-", "")
      );
      const overIndex = parseInt(
        over?.id.toString().replace("breadcrumb-", "") || "0"
      );

      const newBreadcrumbs = arrayMove(
        editingItem.breadcrumbs,
        activeIndex,
        overIndex
      );
      setEditingItem({ ...editingItem, breadcrumbs: newBreadcrumbs });
      toast.success("Breadcrumbs reordered!");
    }
  };

  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && editingItem) {
      const activeIndex = parseInt(
        active.id.toString().replace("gallery-", "")
      );
      const overIndex = parseInt(
        over?.id.toString().replace("gallery-", "") || "0"
      );

      const newGallery = arrayMove(editingItem.gallery, activeIndex, overIndex);
      setEditingItem({ ...editingItem, gallery: newGallery });
      toast.success("Gallery images reordered!");
    }
  };

  const handleSave = () => {
    if (!editingItem) return;

    const updatedData = { ...ocData };
    const { slug, ...itemData } = editingItem;
    updatedData[slug] = itemData;

    const updatedOcsArray = ocsArray.map((oc) =>
      oc.slug === slug ? editingItem : oc
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
    value: string
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleGalleryFieldChange = (
    index: number,
    field: "image" | "thumbnail" | "caption" | "contentWarning",
    value: string
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
    value: string | string[]
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
    value: string
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
    imageIndex: number
  ) => {
    if (!editingItem) return;

    const updatedBreadcrumbs = [...editingItem.breadcrumbs];
    updatedBreadcrumbs[breadcrumbIndex] = {
      ...updatedBreadcrumbs[breadcrumbIndex],
      images: (updatedBreadcrumbs[breadcrumbIndex].images || []).filter(
        (_, i) => i !== imageIndex
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
      (_, i) => i !== index
    );
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(ocData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("OC JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Error copying to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>OC Editor</h2>
        <div className="editor-button-group">
          <button
            onClick={handleSaveToClipboard}
            className="editor-button editor-button-success"
          >
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="editor-button-group">
        <button
          onClick={handleAddNew}
          className="editor-button editor-button-primary"
        >
          Add New OC
        </button>
        <button
          onClick={() => setDragMode(!dragMode)}
          className={`editor-button editor-button-secondary ${
            dragMode ? "active" : ""
          }`}
        >
          {dragMode ? "Exit Drag Mode" : "Rearrange OCs"}
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>OC List</h3>
            </div>
            {dragMode && <p>Drag the ⋮⋮ handle to reorder items</p>}
            {dragMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={ocsArray.map((oc) => oc.slug)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="editor-list">
                    {ocsArray.map((oc) => (
                      <SortableOcItem
                        key={oc.slug}
                        oc={oc}
                        isSelected={selectedSlug === oc.slug}
                        onSelect={handleSelectItem}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="editor-list">
                {ocsArray.map((oc) => (
                  <div
                    key={oc.slug}
                    className={`editor-item ${
                      selectedSlug === oc.slug ? "editor-item-selected" : ""
                    }`}
                  >
                    <div
                      onClick={() => handleSelectItem(oc.slug)}
                      className="editor-item-content"
                    >
                      <img
                        src={oc.avatar?.[0] || "https://placehold.co/40"}
                        alt={oc.name}
                        className="editor-avatar"
                      />
                      <span>
                        <BBCodeDisplay bbcode={oc.name} /> ({oc.slug})
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(oc.slug);
                      }}
                      className="editor-button editor-button-danger editor-button-small"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => {
                    const newName = e.target.value;
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
                  className="editor-input"
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
                    <button
                      onClick={() => {
                        const newAvatars = editingItem.avatar.filter((_, i) => i !== index);
                        setEditingItem({ ...editingItem, avatar: newAvatars });
                      }}
                      className="editor-button editor-button-danger editor-button-small"
                    >
                      Remove
                    </button>
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
                <textarea
                  value={editingItem.info}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, info: e.target.value })
                  }
                  rows={4}
                  className="editor-textarea"
                />
              </div>

              <div className="editor-field">
                <div className="editor-field">
                  <label className="editor-label">Gallery:</label>
                  <button
                    onClick={() => setGalleryDragMode(!galleryDragMode)}
                    className={`editor-button editor-button-secondary ${
                      galleryDragMode ? "active" : ""
                    }`}
                    style={{
                      marginLeft: "10px",
                      fontSize: "12px",
                      padding: "4px 8px",
                    }}
                  >
                    {galleryDragMode ? "Exit Drag Mode" : "Rearrange Gallery"}
                  </button>
                </div>
                {galleryDragMode && editingItem.gallery.length > 0 && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    Drag the ⋮⋮ handle to reorder gallery images
                  </p>
                )}
                {galleryDragMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleGalleryDragEnd}
                  >
                    <SortableContext
                      items={editingItem.gallery.map(
                        (_, index) => `gallery-${index}`
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      {editingItem.gallery.map((galleryItem, index) => (
                        <SortableGalleryItem
                          key={`gallery-${index}`}
                          galleryItem={galleryItem}
                          index={index}
                          onRemove={handleRemoveGalleryItem}
                          onImageChange={(idx, value) =>
                            handleGalleryFieldChange(idx, "image", value)
                          }
                          onThumbnailChange={(idx, value) =>
                            handleGalleryFieldChange(idx, "thumbnail", value)
                          }
                          onCaptionChange={(idx, value) =>
                            handleGalleryFieldChange(idx, "caption", value)
                          }
                          onContentWarningChange={(idx, value) =>
                            handleGalleryFieldChange(
                              idx,
                              "contentWarning",
                              value
                            )
                          }
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  editingItem.gallery.map((galleryItem, index) => (
                    <div key={index} className="editor-section">
                      <div className="editor-section-header">
                        <h4>Gallery Item {index + 1}</h4>
                        <button
                          onClick={() => handleRemoveGalleryItem(index)}
                          className="editor-button editor-button-danger editor-button-small"
                        >
                          Remove
                        </button>
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
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Image URL"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Thumbnail URL:</label>
                        <input
                          type="text"
                          value={galleryItem.thumbnail || ""}
                          onChange={(e) =>
                            handleGalleryFieldChange(
                              index,
                              "thumbnail",
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Thumbnail URL (optional)"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Caption:</label>
                        <input
                          type="text"
                          value={galleryItem.caption || ""}
                          onChange={(e) =>
                            handleGalleryFieldChange(
                              index,
                              "caption",
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Caption (optional)"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Content Warning:</label>
                        <input
                          type="text"
                          value={galleryItem.contentWarning || ""}
                          onChange={(e) =>
                            handleGalleryFieldChange(
                              index,
                              "contentWarning",
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Content warning (optional)"
                        />
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={handleAddGalleryItem}
                  className="editor-button editor-button-primary editor-button-small"
                >
                  Add Gallery Item
                </button>
              </div>

              <div className="editor-field">
                <div className="editor-field">
                  <label className="editor-label">Breadcrumbs:</label>
                  <button
                    onClick={() => setBreadcrumbDragMode(!breadcrumbDragMode)}
                    className={`editor-button editor-button-secondary ${
                      breadcrumbDragMode ? "active" : ""
                    }`}
                    style={{
                      marginLeft: "10px",
                      fontSize: "12px",
                      padding: "4px 8px",
                    }}
                  >
                    {breadcrumbDragMode
                      ? "Exit Drag Mode"
                      : "Rearrange Breadcrumbs"}
                  </button>
                </div>
                {breadcrumbDragMode && editingItem.breadcrumbs.length > 0 && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    Drag the ⋮⋮ handle to reorder breadcrumbs
                  </p>
                )}
                {breadcrumbDragMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleBreadcrumbDragEnd}
                  >
                    <SortableContext
                      items={editingItem.breadcrumbs.map(
                        (_, index) => `breadcrumb-${index}`
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      {editingItem.breadcrumbs.map((breadcrumb, index) => (
                        <SortableBreadcrumbItem
                          key={`breadcrumb-${index}`}
                          breadcrumb={breadcrumb}
                          index={index}
                          onRemove={handleRemoveBreadcrumb}
                          onTitleChange={(idx, value) =>
                            handleBreadcrumbChange(idx, "title", value)
                          }
                          onDescriptionChange={(idx, value) =>
                            handleBreadcrumbChange(idx, "description", value)
                          }
                          onVideoChange={(idx, value) =>
                            handleBreadcrumbChange(idx, "video", value)
                          }
                          onContentWarningChange={(idx, value) =>
                            handleBreadcrumbChange(idx, "contentWarning", value)
                          }
                          onImageChange={handleBreadcrumbImageChange}
                          onAddImage={handleAddBreadcrumbImage}
                          onRemoveImage={handleRemoveBreadcrumbImage}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  editingItem.breadcrumbs.map((breadcrumb, index) => (
                    <div key={index} className="editor-section">
                      <div className="editor-section-header">
                        <h4>Breadcrumb {index + 1}</h4>
                        <button
                          onClick={() => handleRemoveBreadcrumb(index)}
                          className="editor-button editor-button-danger editor-button-small"
                        >
                          Remove Breadcrumb
                        </button>
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Title:</label>
                        <input
                          type="text"
                          value={breadcrumb.title || ""}
                          onChange={(e) =>
                            handleBreadcrumbChange(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Breadcrumb title"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Description:</label>
                        <textarea
                          value={breadcrumb.description}
                          onChange={(e) =>
                            handleBreadcrumbChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="editor-textarea"
                          placeholder="Breadcrumb description"
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
                              e.target.value
                            )
                          }
                          rows={3}
                          className="editor-textarea"
                          placeholder="Paste YouTube iframe embed code here"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Content Warning:</label>
                        <input
                          type="text"
                          value={breadcrumb.contentWarning || ""}
                          onChange={(e) =>
                            handleBreadcrumbChange(
                              index,
                              "contentWarning",
                              e.target.value
                            )
                          }
                          className="editor-input"
                          placeholder="Content warning for breadcrumb images (optional)"
                        />
                      </div>

                      <div className="editor-field">
                        <label className="editor-label">Images:</label>
                        {(breadcrumb.images || []).map(
                          (imageUrl, imageIndex) => (
                            <div key={imageIndex} className="editor-array-item">
                              <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) =>
                                  handleBreadcrumbImageChange(
                                    index,
                                    imageIndex,
                                    e.target.value
                                  )
                                }
                                className="editor-array-input"
                                placeholder="Image URL"
                              />
                              <button
                                onClick={() =>
                                  handleRemoveBreadcrumbImage(index, imageIndex)
                                }
                                className="editor-button editor-button-danger editor-button-small"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )}
                        <button
                          onClick={() => handleAddBreadcrumbImage(index)}
                          className="editor-button editor-button-primary editor-button-small"
                        >
                          Add Image
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                      <button
                        onClick={() => handleRemoveArrayItem("tags", index)}
                        className="editor-button editor-button-danger editor-button-small"
                      >
                        Remove
                      </button>
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
