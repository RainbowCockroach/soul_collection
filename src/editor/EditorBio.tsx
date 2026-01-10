import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
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
import bioDataImport from "../data/bio.json";
import "./EditorCommon.css";

interface BioData {
  name?: string;
  picture: string;
  introduction: string;
}

interface SortableBioItemProps {
  bio: BioData;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableBioItem: React.FC<SortableBioItemProps> = ({
  bio,
  index,
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
  } = useSortable({ id: `bio-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getArtistLabel = (idx: number) => {
    return bio.name || `Artist ${idx + 1}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`editor-item ${isSelected ? "editor-item-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      <div {...attributes} {...listeners} className="editor-drag-handle">
        ⋮⋮
      </div>
      <div className="editor-item-content">
        <div className="editor-item-name">{getArtistLabel(index)}</div>
        <div className="editor-item-slug">
          {bio.introduction.substring(0, 40)}
          {bio.introduction.length > 40 ? "..." : ""}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="editor-button editor-button-danger editor-button-small"
      >
        🗑
      </button>
    </div>
  );
};

export const EditorBio: React.FC = () => {
  const [bioData, setBioData] = useState<BioData[]>([]);
  const [selectedBioIndex, setSelectedBioIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    picture: "",
    introduction: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadBioData();
  }, []);

  const loadBioData = () => {
    try {
      setBioData(bioDataImport);
    } catch (error) {
      console.error("Error loading bio data:", error);
      toast.error("Failed to load bio data");
    }
  };

  const handleSelectBio = (index: number) => {
    const bio = bioData[index];
    if (bio) {
      setSelectedBioIndex(index);
      setFormData({
        name: bio.name || "",
        picture: bio.picture,
        introduction: bio.introduction,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!formData.picture.trim()) {
      toast.error("Picture path cannot be empty");
      return;
    }

    if (!formData.introduction.trim()) {
      toast.error("Introduction cannot be empty");
      return;
    }

    const newBio: BioData = {
      name: formData.name || undefined,
      picture: formData.picture,
      introduction: formData.introduction,
    };

    let updatedBioData: BioData[];
    if (isEditing && selectedBioIndex !== null) {
      updatedBioData = bioData.map((bio, idx) =>
        idx === selectedBioIndex ? newBio : bio
      );
    } else {
      updatedBioData = [...bioData, newBio];
    }

    setBioData(updatedBioData);
    toast.success(isEditing ? "Artist updated" : "Artist added");
    handleCancelEdit();
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Are you sure you want to delete this artist bio?")) {
      const updatedBioData = bioData.filter((_, idx) => idx !== index);
      setBioData(updatedBioData);

      if (selectedBioIndex === index) {
        handleCancelEdit();
      } else if (selectedBioIndex !== null && selectedBioIndex > index) {
        setSelectedBioIndex(selectedBioIndex - 1);
      }
      toast.success("Artist bio deleted");
    }
  };

  const handleCancelEdit = () => {
    setSelectedBioIndex(null);
    setFormData({
      name: "",
      picture: "",
      introduction: "",
    });
    setIsEditing(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIndex = parseInt(active.id.toString().split("-")[1]);
      const overIndex = parseInt(over.id.toString().split("-")[1]);

      const newBioData = arrayMove(bioData, activeIndex, overIndex);
      setBioData(newBioData);

      // Update selected index if needed
      if (selectedBioIndex === activeIndex) {
        setSelectedBioIndex(overIndex);
      } else if (selectedBioIndex === overIndex) {
        setSelectedBioIndex(
          activeIndex > overIndex
            ? selectedBioIndex + 1
            : selectedBioIndex - 1
        );
      }
    }
  };

  const handleSaveToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(bioData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Bio JSON copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="editor-container">
      <Toaster position="top-right" />

      <div className="editor-header">
        <h2>Biography Editor</h2>
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
              <h3>Artists ({bioData.length})</h3>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={bioData.map((_, index) => `bio-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {bioData.map((bio, index) => (
                  <SortableBioItem
                    key={`bio-${index}`}
                    bio={bio}
                    index={index}
                    isSelected={selectedBioIndex === index}
                    onSelect={handleSelectBio}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-form">
            <h3>{isEditing ? "Edit Artist" : "Add New Artist"}</h3>

            <div className="editor-field">
              <label className="editor-label">Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Sam"
                className="editor-input"
              />
              <p className="editor-text-muted">
                Optional: Artist's name for the chat bubble header
              </p>
            </div>

            <div className="editor-field">
              <label className="editor-label">Picture Path:</label>
              <input
                type="text"
                value={formData.picture}
                onChange={(e) =>
                  setFormData({ ...formData, picture: e.target.value })
                }
                placeholder="e.g., soul_collection/assets/bio/artist.png"
                className="editor-input"
              />
              <p className="editor-text-muted">
                Path relative to public folder
              </p>
            </div>

            <div className="editor-field">
              <label className="editor-label">Introduction:</label>
              <textarea
                value={formData.introduction}
                onChange={(e) =>
                  setFormData({ ...formData, introduction: e.target.value })
                }
                placeholder="Enter introduction text..."
                className="editor-textarea"
                rows={10}
                style={{ minHeight: "200px" }}
              />
              <p className="editor-text-muted">
                Text displayed in the chat bubble (no formatting)
              </p>
            </div>

            <div className="editor-button-group">
              <button
                onClick={handleSave}
                className="editor-button editor-button-success"
              >
                {isEditing ? "Update" : "Add"} Artist
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

export default EditorBio;
