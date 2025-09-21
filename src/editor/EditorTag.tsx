import React, { useState, useEffect } from "react";
import type { Tag } from "../helpers/objects";
import { loadTags } from "../helpers/data-load";
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
import "./EditorTag.css";
import "./EditorCommon.css";

interface TagJsonData {
  [key: string]: Omit<Tag, "slug">;
}

interface SortableTagItemProps {
  tag: Tag;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
}

const SortableTagItem: React.FC<SortableTagItemProps> = ({
  tag,
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
  } = useSortable({ id: tag.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`editor-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(tag.slug)}
    >
      <div {...attributes} {...listeners} className="editor-drag-handle">
        ⋮⋮
      </div>
      <div
        className="editor-tag-preview"
        style={{
          backgroundColor: tag.backgroundColour,
          color: tag.textColour,
        }}
      >
        {tag.name}
      </div>
      <div className="editor-item-slug">{tag.slug}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(tag.slug);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        🗑
      </button>
    </div>
  );
};

const EditorTag: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagData, setTagData] = useState<TagJsonData>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    backgroundColour: "#3498DB",
    textColour: "#FFFFFF",
  });
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTagsData();
  }, []);

  const loadTagsData = async () => {
    try {
      const loadedTags = await loadTags();
      setTags(loadedTags);
      
      const jsonData: TagJsonData = {};
      loadedTags.forEach((tag) => {
        jsonData[tag.slug] = {
          name: tag.name,
          backgroundColour: tag.backgroundColour,
          textColour: tag.textColour,
        };
      });
      setTagData(jsonData);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast.error("Failed to load tags");
    }
  };

  const generateSlug = (name: string): string => {
    return slugify(name, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  };

  const handleSelectTag = (slug: string) => {
    const tag = tags.find((t) => t.slug === slug);
    if (tag) {
      setSelectedTag(slug);
      setFormData({
        name: tag.name,
        backgroundColour: tag.backgroundColour,
        textColour: tag.textColour,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    const slug = isEditing && selectedTag ? selectedTag : generateSlug(formData.name);
    
    if (!isEditing && tags.some((tag) => tag.slug === slug)) {
      toast.error("A tag with this name already exists");
      return;
    }

    const newTag: Tag = {
      slug,
      name: formData.name,
      backgroundColour: formData.backgroundColour,
      textColour: formData.textColour,
    };

    let updatedTags: Tag[];
    if (isEditing && selectedTag) {
      updatedTags = tags.map((tag) =>
        tag.slug === selectedTag ? newTag : tag
      );
    } else {
      updatedTags = [...tags, newTag];
    }

    setTags(updatedTags);

    const updatedTagData: TagJsonData = {};
    updatedTags.forEach((tag) => {
      updatedTagData[tag.slug] = {
        name: tag.name,
        backgroundColour: tag.backgroundColour,
        textColour: tag.textColour,
      };
    });
    setTagData(updatedTagData);

    toast.success(isEditing ? "Tag updated" : "Tag created");
    handleCancelEdit();
  };

  const handleDelete = (slug: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      const updatedTags = tags.filter((tag) => tag.slug !== slug);
      setTags(updatedTags);

      const updatedTagData: TagJsonData = {};
      updatedTags.forEach((tag) => {
        updatedTagData[tag.slug] = {
          name: tag.name,
          backgroundColour: tag.backgroundColour,
          textColour: tag.textColour,
        };
      });
      setTagData(updatedTagData);

      if (selectedTag === slug) {
        handleCancelEdit();
      }
      toast.success("Tag deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedTag(null);
    setFormData({
      name: "",
      backgroundColour: "#3498DB",
      textColour: "#FFFFFF",
    });
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((tag) => tag.slug === active.id);
      const newIndex = tags.findIndex((tag) => tag.slug === over.id);

      const newTags = arrayMove(tags, oldIndex, newIndex);
      setTags(newTags);

      const updatedTagData: TagJsonData = {};
      newTags.forEach((tag) => {
        updatedTagData[tag.slug] = {
          name: tag.name,
          backgroundColour: tag.backgroundColour,
          textColour: tag.textColour,
        };
      });
      setTagData(updatedTagData);
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(tagData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Tag JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Tag Editor</h2>
        <button
          onClick={handleSaveToClipboard}
          className="editor-button editor-button-success"
        >
          Copy to clipboard
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Tags ({tags.length})</h3>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tags.map((tag) => tag.slug)}
                strategy={verticalListSortingStrategy}
              >
                {tags.map((tag) => (
                  <SortableTagItem
                    key={tag.slug}
                    tag={tag}
                    isSelected={selectedTag === tag.slug}
                    onSelect={handleSelectTag}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Tag" : "Add New Tag"}</h3>

            <div className="editor-field">
              <label className="editor-label">Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
                className="editor-input"
              />
            </div>

            <div className="editor-field">
              <label className="editor-label">Background Color:</label>
              <div className="editor-color-group">
                <input
                  type="color"
                  value={formData.backgroundColour}
                  onChange={(e) =>
                    setFormData({ ...formData, backgroundColour: e.target.value })
                  }
                  className="editor-color-picker"
                />
                <input
                  type="text"
                  value={formData.backgroundColour}
                  onChange={(e) =>
                    setFormData({ ...formData, backgroundColour: e.target.value })
                  }
                  placeholder="#000000"
                  className="editor-color-text"
                />
              </div>
            </div>

            <div className="editor-field">
              <label className="editor-label">Text Color:</label>
              <div className="editor-color-group">
                <input
                  type="color"
                  value={formData.textColour}
                  onChange={(e) =>
                    setFormData({ ...formData, textColour: e.target.value })
                  }
                  className="editor-color-picker"
                />
                <input
                  type="text"
                  value={formData.textColour}
                  onChange={(e) =>
                    setFormData({ ...formData, textColour: e.target.value })
                  }
                  placeholder="#FFFFFF"
                  className="editor-color-text"
                />
              </div>
            </div>

            <div className="editor-field">
              <label className="editor-label">Preview:</label>
              <div
                className="editor-tag-preview"
                style={{
                  backgroundColor: formData.backgroundColour,
                  color: formData.textColour,
                  padding: "8px 16px",
                  borderRadius: "16px",
                  textAlign: "center",
                  fontWeight: "500"
                }}
              >
                {formData.name || "Tag Preview"}
              </div>
            </div>

            <div className="editor-button-group">
              <button
                onClick={handleSave}
                className="editor-button editor-button-success"
              >
                {isEditing ? "Update" : "Add"} Tag
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="editor-button editor-button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTag;