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
      <div>
        {/* First row */}
        <div className="detail-block-avatar">
          <img src={oc.avatar} alt={oc.name} className="detail-avatar" />
        </div>
      </div>
      <div>
        {/* Second row */}
        <div className="detail-block-info">
          <h1 className="detail-oc-name">{oc.name}</h1>
          <p>{oc.info}</p>
        </div>
        <div className="detail-block-gallery">
          <div className="detail-gallery-grid">
            {oc.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${oc.name} gallery ${index + 1}`}
                className="detail-gallery-image"
              />
            ))}
          </div>
        </div>
      </div>
      <div>
        {/* Third row */}
        <div className="detail-block-species">
          <div className="detail-species-list">
            {oc.speciesDetails.map((species) => (
              <div key={species.slug} className="detail-species-item">
                <span className="detail-species-name">{species.name}</span>
                <p className="detail-species-description">
                  {species.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-block-breadcrumbs">
          <div className="detail-breadcrumbs-list">
            {oc.breadcrumbs.map((breadcrumb, index) => (
              <p key={index} className="detail-breadcrumb-item">
                {breadcrumb}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-block-tags">
        <div className="detail-tags-list">
          {oc.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageDetail;
