import React, { useState, useEffect } from "react";
import type { OC, Group, Spieces, BreadcrumbItem } from "../helpers/objects";
import { loadOCs, loadGroups, loadSpecies } from "../helpers/data-load";
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
import "./EditorOc.css";

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
  onImageChange: (breadcrumbIndex: number, imageIndex: number, value: string) => void;
  onAddImage: (breadcrumbIndex: number) => void;
  onRemoveImage: (breadcrumbIndex: number, imageIndex: number) => void;
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
      className={`editor-oc-item ${
        isSelected ? "editor-oc-item-selected" : "editor-oc-item-default"
      }`}
    >
      <div className="editor-oc-item-drag-handle" {...listeners}>
        ⋮⋮
      </div>
      <div onClick={() => onSelect(oc.slug)} className="editor-oc-item-content">
        <img
          src={oc.avatar || "https://placehold.co/40"}
          alt={oc.name}
          className="editor-oc-avatar"
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
        className="editor-oc-delete-button"
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
      className="editor-oc-breadcrumb-item"
    >
      <div className="editor-oc-breadcrumb-header">
        <div className="editor-oc-breadcrumb-drag-handle" {...listeners}>
          ⋮⋮
        </div>
        <h4>Breadcrumb {index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="editor-oc-remove-button"
        >
          Remove Breadcrumb
        </button>
      </div>

      <div className="editor-oc-field">
        <label className="editor-oc-label">Title:</label>
        <input
          type="text"
          value={breadcrumb.title || ""}
          onChange={(e) => onTitleChange(index, e.target.value)}
          className="editor-oc-input"
          placeholder="Breadcrumb title"
        />
      </div>

      <div className="editor-oc-field">
        <label className="editor-oc-label">Description:</label>
        <textarea
          value={breadcrumb.description}
          onChange={(e) => onDescriptionChange(index, e.target.value)}
          rows={3}
          className="editor-oc-textarea"
          placeholder="Breadcrumb description"
        />
      </div>

      <div className="editor-oc-field">
        <label className="editor-oc-label">Images:</label>
        {breadcrumb.images.map((imageUrl, imageIndex) => (
          <div key={imageIndex} className="editor-oc-array-item">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onImageChange(index, imageIndex, e.target.value)}
              className="editor-oc-array-input"
              placeholder="Image URL"
            />
            <button
              onClick={() => onRemoveImage(index, imageIndex)}
              className="editor-oc-remove-button"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => onAddImage(index)}
          className="editor-oc-add-button"
        >
          Add Image
        </button>
      </div>
    </div>
  );
};

export const EditorOc: React.FC = () => {
  const [ocData, setOcData] = useState<OcJsonData>({});
  const [ocsArray, setOcsArray] = useState<OC[]>([]);
  const [groupData, setGroupData] = useState<GroupJsonData>({});
  const [spiecesData, setSpiecesData] = useState<SpiecesJsonData>({});
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [editingItem, setEditingItem] = useState<OC | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [breadcrumbDragMode, setBreadcrumbDragMode] = useState(false);

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
      const [ocsArray, groupsArray, speciesArray] = await Promise.all([
        loadOCs(),
        loadGroups(),
        loadSpecies(),
      ]);

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
      const activeIndex = parseInt(active.id.toString().replace('breadcrumb-', ''));
      const overIndex = parseInt(over?.id.toString().replace('breadcrumb-', '') || '0');

      const newBreadcrumbs = arrayMove(editingItem.breadcrumbs, activeIndex, overIndex);
      setEditingItem({ ...editingItem, breadcrumbs: newBreadcrumbs });
      toast.success("Breadcrumbs reordered!");
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
          avatar: "",
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
    field: "gallery" | "tags",
    index: number,
    value: string
  ) => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field]];
    updatedArray[index] = value;
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleAddArrayItem = (field: "gallery" | "tags") => {
    if (!editingItem) return;

    const updatedArray = [...editingItem[field], ""];
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleRemoveArrayItem = (field: "gallery" | "tags", index: number) => {
    if (!editingItem) return;

    const updatedArray = editingItem[field].filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, [field]: updatedArray });
  };

  const handleBreadcrumbChange = (
    index: number,
    field: "title" | "description" | "images",
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
    const updatedImages = [...updatedBreadcrumbs[breadcrumbIndex].images];
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
      images: [...updatedBreadcrumbs[breadcrumbIndex].images, ""],
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
      images: updatedBreadcrumbs[breadcrumbIndex].images.filter(
        (_, i) => i !== imageIndex
      ),
    };
    setEditingItem({ ...editingItem, breadcrumbs: updatedBreadcrumbs });
  };

  const handleAddBreadcrumb = () => {
    if (!editingItem) return;

    const newBreadcrumb: BreadcrumbItem = { title: "", images: [], description: "" };
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
    <div className="editor-oc-container">
      <Toaster position="top-right" />
      <h2>OC Editor</h2>

      <div className="editor-oc-buttons">
        <button onClick={handleAddNew} className="editor-oc-button">
          Add New OC
        </button>
        <button
          onClick={() => setDragMode(!dragMode)}
          className={`editor-oc-button ${dragMode ? "active" : ""}`}
        >
          {dragMode ? "Exit Drag Mode" : "Rearrange stuff"}
        </button>
        <button
          onClick={handleSaveToClipboard}
          className="editor-oc-save-button"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-oc-layout">
        <div className="editor-oc-left">
          <h3>OC List</h3>
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
                <div className="editor-oc-list">
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
            <div className="editor-oc-list">
              {ocsArray.map((oc) => (
                <div
                  key={oc.slug}
                  className={`editor-oc-item ${
                    selectedSlug === oc.slug
                      ? "editor-oc-item-selected"
                      : "editor-oc-item-default"
                  }`}
                >
                  <div
                    onClick={() => handleSelectItem(oc.slug)}
                    className="editor-oc-item-content"
                  >
                    <img
                      src={oc.avatar || "https://placehold.co/40"}
                      alt={oc.name}
                      className="editor-oc-avatar"
                    />
                    <span>
                      <strong>{oc.name}</strong> ({oc.slug})
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(oc.slug);
                    }}
                    className="editor-oc-delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isEditing && editingItem && (
          <div className="editor-oc-right">
            <h3>Edit OC</h3>
            <div className="editor-oc-form">
              <div className="editor-oc-field">
                <label className="editor-oc-label">Url name:</label>
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
                  className="editor-oc-input"
                  disabled={!isNewItem()}
                  style={{
                    backgroundColor: !isNewItem() ? "#f5f5f5" : "white",
                    cursor: !isNewItem() ? "not-allowed" : "text",
                  }}
                />
                {!isNewItem() && (
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    URL names cannot be changed for existing OCs to prevent data
                    corruption
                  </small>
                )}
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Name:</label>
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
                  className="editor-oc-input"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Avatar URL:</label>
                <input
                  type="text"
                  value={editingItem.avatar}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, avatar: e.target.value })
                  }
                  className="editor-oc-input"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Groups:</label>
                <div className="editor-oc-checkboxes">
                  {Object.entries(groupData).map(([slug, group]) => (
                    <div key={slug} className="editor-oc-checkbox-item">
                      <label className="editor-oc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingItem.group.includes(slug)}
                          onChange={() => handleGroupToggle(slug)}
                        />
                        <div
                          className="editor-oc-group-color-box"
                          style={{ backgroundColor: group.frameColour }}
                        />
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Species:</label>
                <div className="editor-oc-checkboxes">
                  {Object.entries(spiecesData).map(([slug, species]) => (
                    <div key={slug} className="editor-oc-checkbox-item">
                      <label className="editor-oc-checkbox-label">
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

              <div className="editor-oc-field">
                <label className="editor-oc-label">Info:</label>
                <textarea
                  value={editingItem.info}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, info: e.target.value })
                  }
                  rows={4}
                  className="editor-oc-textarea"
                />
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Gallery:</label>
                {editingItem.gallery.map((url, index) => (
                  <div key={index} className="editor-oc-array-item">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleArrayFieldChange("gallery", index, e.target.value)
                      }
                      className="editor-oc-array-input"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("gallery", index)}
                      className="editor-oc-remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("gallery")}
                  className="editor-oc-add-button"
                >
                  Add Gallery Item
                </button>
              </div>

              <div className="editor-oc-field">
                <div className="editor-oc-breadcrumb-controls">
                  <label className="editor-oc-label">Breadcrumbs:</label>
                  <button
                    onClick={() => setBreadcrumbDragMode(!breadcrumbDragMode)}
                    className={`editor-oc-button ${breadcrumbDragMode ? "active" : ""}`}
                    style={{ marginLeft: "10px", fontSize: "12px", padding: "4px 8px" }}
                  >
                    {breadcrumbDragMode ? "Exit Drag Mode" : "Rearrange Breadcrumbs"}
                  </button>
                </div>
                {breadcrumbDragMode && editingItem.breadcrumbs.length > 0 && (
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
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
                      items={editingItem.breadcrumbs.map((_, index) => `breadcrumb-${index}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {editingItem.breadcrumbs.map((breadcrumb, index) => (
                        <SortableBreadcrumbItem
                          key={`breadcrumb-${index}`}
                          breadcrumb={breadcrumb}
                          index={index}
                          onRemove={handleRemoveBreadcrumb}
                          onTitleChange={(idx, value) => handleBreadcrumbChange(idx, "title", value)}
                          onDescriptionChange={(idx, value) => handleBreadcrumbChange(idx, "description", value)}
                          onImageChange={handleBreadcrumbImageChange}
                          onAddImage={handleAddBreadcrumbImage}
                          onRemoveImage={handleRemoveBreadcrumbImage}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  editingItem.breadcrumbs.map((breadcrumb, index) => (
                    <div key={index} className="editor-oc-breadcrumb-item">
                      <div className="editor-oc-breadcrumb-header">
                        <h4>Breadcrumb {index + 1}</h4>
                        <button
                          onClick={() => handleRemoveBreadcrumb(index)}
                          className="editor-oc-remove-button"
                        >
                          Remove Breadcrumb
                        </button>
                      </div>

                      <div className="editor-oc-field">
                        <label className="editor-oc-label">Title:</label>
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
                          className="editor-oc-input"
                          placeholder="Breadcrumb title"
                        />
                      </div>

                      <div className="editor-oc-field">
                        <label className="editor-oc-label">Description:</label>
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
                          className="editor-oc-textarea"
                          placeholder="Breadcrumb description"
                        />
                      </div>

                      <div className="editor-oc-field">
                        <label className="editor-oc-label">Images:</label>
                        {breadcrumb.images.map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="editor-oc-array-item">
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
                              className="editor-oc-array-input"
                              placeholder="Image URL"
                            />
                            <button
                              onClick={() =>
                                handleRemoveBreadcrumbImage(index, imageIndex)
                              }
                              className="editor-oc-remove-button"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddBreadcrumbImage(index)}
                          className="editor-oc-add-button"
                        >
                          Add Image
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={handleAddBreadcrumb}
                  className="editor-oc-add-button"
                >
                  Add Breadcrumb
                </button>
              </div>

              <div className="editor-oc-field">
                <label className="editor-oc-label">Tags:</label>
                {editingItem.tags.map((tag, index) => (
                  <div key={index} className="editor-oc-array-item">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) =>
                        handleArrayFieldChange("tags", index, e.target.value)
                      }
                      className="editor-oc-array-input"
                      placeholder="Tag"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem("tags", index)}
                      className="editor-oc-remove-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem("tags")}
                  className="editor-oc-add-button"
                >
                  Add Tag
                </button>
              </div>

              <div className="editor-oc-form-buttons">
                <button
                  onClick={handleSave}
                  className="editor-oc-save-form-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="editor-oc-cancel-button"
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
