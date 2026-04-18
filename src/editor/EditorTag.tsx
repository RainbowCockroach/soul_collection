import React, { useState, useEffect } from "react";
import type { Tag } from "../helpers/objects";
import { loadTags } from "../helpers/data-load";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import SavePushButton from "./SavePushButton";
import CopyToClipboardButton from "./CopyToClipboardButton";
import ReorderButtons from "./ReorderButtons";
import DeleteButton from "./DeleteButton";
import "./EditorCommon.css";

interface TagJsonData {
  [key: string]: Omit<Tag, "slug">;
}

interface TagItemProps {
  tag: Tag;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (slug: string) => void;
  onDelete: (slug: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

const TagItem: React.FC<TagItemProps> = ({
  tag,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
}) => {
  return (
    <div
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(tag.slug)}
    >
      <ReorderButtons index={index} total={total} onMove={onMove} />
      <div
        className="editor-tag-preview"
        style={{
          backgroundColor: tag.backgroundColour,
          color: tag.textColour,
        }}
      >
        {tag.name}
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteButton onClick={() => onDelete(tag.slug)} title="Delete tag" />
      </span>
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

  const buildTagData = (tagList: Tag[]): TagJsonData => {
    const data: TagJsonData = {};
    tagList.forEach((tag) => {
      data[tag.slug] = {
        name: tag.name,
        backgroundColour: tag.backgroundColour,
        textColour: tag.textColour,
      };
    });
    return data;
  };

  useEffect(() => {
    loadTagsData();
  }, []);

  const loadTagsData = async () => {
    try {
      const loadedTags = await loadTags();
      setTags(loadedTags);
      setTagData(buildTagData(loadedTags));
    } catch (error) {
      console.error("Error loading tags:", error);
      toast.error("Failed to load tags");
    }
  };

  const generateSlug = (name: string): string => {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
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

    const slug =
      isEditing && selectedTag ? selectedTag : generateSlug(formData.name);

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
        tag.slug === selectedTag ? newTag : tag,
      );
    } else {
      updatedTags = [...tags, newTag];
    }

    setTags(updatedTags);
    setTagData(buildTagData(updatedTags));

    toast.success(isEditing ? "Tag updated" : "Tag created");
    handleCancelEdit();
  };

  const handleDelete = (slug: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      const updatedTags = tags.filter((tag) => tag.slug !== slug);
      setTags(updatedTags);
      setTagData(buildTagData(updatedTags));

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

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tags.length) return;

    const newTags = [...tags];
    [newTags[index], newTags[newIndex]] = [newTags[newIndex], newTags[index]];
    setTags(newTags);
    setTagData(buildTagData(newTags));
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <div className="editor-button-group">
          <SavePushButton fileId="tag" getData={() => tagData} />
          <CopyToClipboardButton
            getData={() => tagData}
            entityLabel="Tag JSON"
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-left">
          <div className="editor-list">
            <div className="editor-list-header">
              <h3>Tags ({tags.length})</h3>
            </div>
            {tags.map((tag, index) => (
              <TagItem
                key={tag.slug}
                tag={tag}
                index={index}
                total={tags.length}
                isSelected={selectedTag === tag.slug}
                onSelect={handleSelectTag}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}
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
                    setFormData({
                      ...formData,
                      backgroundColour: e.target.value,
                    })
                  }
                  className="editor-color-picker"
                />
                <input
                  type="text"
                  value={formData.backgroundColour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      backgroundColour: e.target.value,
                    })
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
                  fontWeight: "500",
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
                Save
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
