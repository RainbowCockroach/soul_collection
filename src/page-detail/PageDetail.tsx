import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadOcBySlug, type OcWithDetails } from "../helpers/data-load";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [oc, setOc] = useState<OcWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOcData = async () => {
      if (!slug) {
        setError("No character slug provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ocData = await loadOcBySlug(slug);
        if (!ocData) {
          setError("Character not found");
        } else {
          setOc(ocData);
        }
      } catch (err) {
        setError("Failed to load character data");
        console.error("Error loading OC data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOcData();
  }, [slug]);

  if (isLoading) {
    return <div>Loading character...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!oc) {
    return <div>Character not found</div>;
  }

  return (
    <div className="page-detail">
      <div className="character-header">
        <img src={oc.avatar} alt={oc.name} className="character-avatar" />
        <h1 className="character-name">{oc.name}</h1>
      </div>

      <div className="character-info">
        <h2>Information</h2>
        <p>{oc.info}</p>
      </div>

      <div className="character-groups">
        <h2>Groups</h2>
        <div className="groups-list">
          {oc.groupDetails.map((group) => (
            <div key={group.slug} className="group-item">
              <span className="group-name">{group.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="character-species">
        <h2>Species</h2>
        <div className="species-list">
          {oc.speciesDetails.map((species) => (
            <div key={species.slug} className="species-item">
              <span className="species-name">{species.name}</span>
              <p className="species-description">{species.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="character-tags">
        <h2>Tags</h2>
        <div className="tags-list">
          {oc.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="character-gallery">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {oc.gallery.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${oc.name} gallery ${index + 1}`}
              className="gallery-image"
            />
          ))}
        </div>
      </div>

      <div className="character-breadcrumbs">
        <h2>Additional Notes</h2>
        <div className="breadcrumbs-list">
          {oc.breadcrumbs.map((breadcrumb, index) => (
            <p key={index} className="breadcrumb-item">
              {breadcrumb}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageDetail;
