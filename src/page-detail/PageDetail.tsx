import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadOcBySlug, type OcWithDetails } from "../helpers/data-load";
import GalleryBlock from "../common-components/GalleryBlock";
import ZoomPanPinchImage from "../common-components/ZoomPanPinchImage";
import "./PageDetail.css";
import { placeholderImage } from "../helpers/constants";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import ImageWithInfoMany from "../common-components/ImageWithInfoMany";

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
      <div className="detail-block-image-view div-3d-with-shadow">
        <ZoomPanPinchImage src={currentDisplayAvatar} alt={oc.name} />
      </div>
      <div className="detail-block-gallery div-3d-with-shadow">
        <GalleryBlock
          gallery={oc.gallery}
          characterName={oc.name}
          onImageClick={(image) => {
            console.log("image clicked", image);
            setCurrentDisplayAvatar(image);
          }}
        />
      </div>
      <div className="detail-block-info div-3d-with-shadow">
        <h1 className="detail-oc-name">{oc.name}</h1>
        <BBCodeDisplay bbcode={oc.info} />
      </div>
      <div className="detail-block-species div-3d-with-shadow">
        <ImageWithInfoMany
          items={oc.speciesDetails.map((species) => ({
            images: species.gallery,
            description: species.description,
            title: species.name,
          }))}
        />
      </div>
      <div className="detail-block-breadcrumbs div-3d-with-shadow">
        <ImageWithInfoMany
          items={oc.breadcrumbs.map((breadcrumb, index) => ({
            images: breadcrumb.images,
            description: breadcrumb.description,
            title: `Breadcrumb ${index + 1}`,
          }))}
        />
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
