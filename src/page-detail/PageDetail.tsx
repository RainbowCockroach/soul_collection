import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadOcBySlug, type OcWithDetails } from "../helpers/data-load";
import DetailBlockGallery from "./DetailBlockGallery";
import "./PageDetail.css";
import { placeholderImage } from "../helpers/constants";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [oc, setOc] = useState<OcWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDisplayAvatar, setCurrentDisplayAvatar] =
    useState<string>(placeholderImage);

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

  useEffect(() => {
    if (oc?.gallery && oc.gallery.length > 0) {
      setCurrentDisplayAvatar(oc.gallery[0]);
    }
  }, [oc]);

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
      {/* First row */}
      <div className="detail-block-image-view debug">
        <img
          src={currentDisplayAvatar}
          alt={oc.name}
          className="detail-image-view"
        />
      </div>
      <DetailBlockGallery
        gallery={oc.gallery}
        characterName={oc.name}
        onImageClick={(image) => {
          console.log("image clicked", image);
          setCurrentDisplayAvatar(image);
        }}
      />
      <div className="detail-block-info debug">
        <h1 className="detail-oc-name">{oc.name}</h1>
        <p>{oc.info}</p>
      </div>
      <div className="detail-block-species debug">
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
      <div className="detail-block-breadcrumbs debug">
        <div className="detail-breadcrumbs-list">
          {oc.breadcrumbs.map((breadcrumb, index) => (
            <p key={index} className="detail-breadcrumb-item">
              {breadcrumb}
            </p>
          ))}
        </div>
      </div>

      <div className="detail-block-tags debug">
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
