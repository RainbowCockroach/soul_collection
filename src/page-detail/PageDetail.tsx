import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  loadOcBySlug,
  findLinkedOc,
  type OcWithDetails,
} from "../helpers/data-load";
import GalleryBlock from "../common-components/GalleryBlock";
import ZoomPanPinchImage from "../common-components/ZoomPanPinchImage";
import "./PageDetail.css";
import { placeholderImage } from "../helpers/constants";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import ImageWithInfoMany, {
  type ImageWithInfoManyRef,
} from "../common-components/ImageWithInfoMany";
import SwitchFormButton from "./SwitchFormButton";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [oc, setOc] = useState<OcWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDisplayAvatar, setCurrentDisplayAvatar] =
    useState<string>(placeholderImage);
  const [currentDisplayAvatarCaption, setCurrentDisplayAvatarCaption] =
    useState<string | undefined>(undefined);
  const [linkedOcSlug, setLinkedOcSlug] = useState<string | null>(null);
  const [linkedOcName, setLinkedOcName] = useState<string | null>(null);

  const speciesCarouselRef = useRef<ImageWithInfoManyRef>(null);
  const breadcrumbsCarouselRef = useRef<ImageWithInfoManyRef>(null);

  const displayButtonSpecies =
    oc?.speciesDetails.length && oc.speciesDetails.length > 1;
  const displayButtonBreadcrumbs =
    oc?.breadcrumbs.length && oc.breadcrumbs.length > 1;

  useEffect(() => {
    const loadOcData = async () => {
      if (!slug) {
        setError("No character slug provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [ocData, linkedSlug] = await Promise.all([
          loadOcBySlug(slug),
          findLinkedOc(slug),
        ]);

        if (!ocData) {
          setError("Character not found");
        } else {
          setOc(ocData);
        }

        if (linkedSlug) {
          setLinkedOcSlug(linkedSlug);
          // Load the linked OC's name
          const linkedOcData = await loadOcBySlug(linkedSlug);
          setLinkedOcName(linkedOcData?.name || null);
        } else {
          setLinkedOcSlug(null);
          setLinkedOcName(null);
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
      setCurrentDisplayAvatar(oc.gallery[0].image);
      setCurrentDisplayAvatarCaption(oc.gallery[0].caption || undefined);
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
        <ZoomPanPinchImage
          src={currentDisplayAvatar}
          alt={oc.name}
          caption={currentDisplayAvatarCaption}
        />
      </div>
      <div className="detail-block-gallery div-3d-with-shadow">
        <GalleryBlock
          gallery={oc.gallery}
          characterName={oc.name}
          onImageClick={(galleryItem) => {
            setCurrentDisplayAvatar(galleryItem.image);
            setCurrentDisplayAvatarCaption(galleryItem.caption || undefined);
          }}
        />
      </div>
      <div className="detail-block-info div-3d-with-shadow">
        <h1 className="detail-oc-name">
          <BBCodeDisplay bbcode={oc.name} />
        </h1>
        {/* Switch Form Button */}
        {linkedOcSlug && linkedOcName && (
          <SwitchFormButton
            linkedOcSlug={linkedOcSlug}
            linkedOcName={linkedOcName}
            isGodForm={oc.group.includes("god")}
          />
        )}
        <BBCodeDisplay bbcode={oc.info} />
      </div>
      <div className="detail-block-species">
        <div className="div-3d-with-shadow detail-section-header">
          {displayButtonSpecies && (
            <button
              className="section-nav-button section-nav-button--left"
              onClick={() => speciesCarouselRef.current?.scrollPrev()}
            >
              ◀
            </button>
          )}
          <h2>Species</h2>
          {displayButtonSpecies && (
            <button
              className="section-nav-button section-nav-button--right"
              onClick={() => speciesCarouselRef.current?.scrollNext()}
            >
              ▶
            </button>
          )}
        </div>
        <div className="div-3d-with-shadow detail-section-content">
          <ImageWithInfoMany
            ref={speciesCarouselRef}
            items={oc.speciesDetails.map((species) => ({
              images: species.gallery,
              description: species.description,
              title: species.name,
            }))}
          />
        </div>
      </div>
      <div className="detail-block-breadcrumbs">
        <div className="div-3d-with-shadow detail-section-header">
          {displayButtonBreadcrumbs && (
            <button
              className="section-nav-button section-nav-button--left"
              onClick={() => breadcrumbsCarouselRef.current?.scrollPrev()}
            >
              ◀
            </button>
          )}
          <h2>Breadcrumbs</h2>
          {displayButtonBreadcrumbs && (
            <button
              className="section-nav-button section-nav-button--right"
              onClick={() => breadcrumbsCarouselRef.current?.scrollNext()}
            >
              ▶
            </button>
          )}
        </div>
        <div className="div-3d-with-shadow detail-section-content">
          <ImageWithInfoMany
            ref={breadcrumbsCarouselRef}
            items={oc.breadcrumbs.map((breadcrumb) => ({
              images: breadcrumb.images,
              description: breadcrumb.description,
              title: breadcrumb.title,
            }))}
            showButtons={false}
          />
        </div>
      </div>

      <div className="detail-block-tags">
        {oc.tagDetails.map((tag, index) => (
          <span
            key={index}
            className="oc-detail-tag div-3d-with-shadow"
            style={{
              backgroundColor: tag.backgroundColour,
              color: tag.textColour,
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PageDetail;
