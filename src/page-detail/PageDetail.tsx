import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  loadOcBySlug,
  findLinkedOc,
  loadOcBackstory,
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
import ArrowButton from "../common-components/ArrowButton";
import AudioPlayer from "../common-components/AudioPlayer";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [oc, setOc] = useState<OcWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDisplayAvatar, setCurrentDisplayAvatar] =
    useState<string>(placeholderImage);
  const [currentDisplayAvatarCaption, setCurrentDisplayAvatarCaption] =
    useState<string | undefined>(undefined);
  const [
    currentDisplayAvatarContentWarning,
    setCurrentDisplayAvatarContentWarning,
  ] = useState<string | undefined>(undefined);
  const [linkedOcSlug, setLinkedOcSlug] = useState<string | null>(null);
  const [linkedOcName, setLinkedOcName] = useState<string | null>(null);
  const [isGodForm, setIsGodForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "backstory">("info");
  const [backstory, setBackstory] = useState<string | null>(null);
  const [backstoryLoading, setBackstoryLoading] = useState(false);

  const speciesCarouselRef = useRef<ImageWithInfoManyRef>(null);
  const breadcrumbsCarouselRef = useRef<ImageWithInfoManyRef>(null);

  const displayButtonSpecies =
    oc?.speciesDetails.length && oc.speciesDetails.length > 1;
  const displayButtonBreadcrumbs =
    oc?.breadcrumbs.length && oc.breadcrumbs.length > 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
          console.log("Loaded OC data:", ocData);
          setIsGodForm(ocData.group.includes("god"));
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
    const loadBackstory = async () => {
      if (!slug) return;

      setBackstoryLoading(true);
      const backstoryContent = await loadOcBackstory(slug);
      setBackstory(backstoryContent);
      setBackstoryLoading(false);
    };

    loadBackstory();
  }, [slug]);

  useEffect(() => {
    if (oc?.gallery && oc.gallery.length > 0) {
      setCurrentDisplayAvatar(oc.gallery[0].image);
      setCurrentDisplayAvatarCaption(oc.gallery[0].caption || undefined);
      setCurrentDisplayAvatarContentWarning(
        oc.gallery[0].contentWarning || undefined,
      );
    }
  }, [oc]);

  // Apply God Form inversion to html element for maximum coverage
  useEffect(() => {
    if (isGodForm) {
      document.documentElement.classList.add("god-form-inverted");
    } else {
      document.documentElement.classList.remove("god-form-inverted");
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove("god-form-inverted");
    };
  }, [isGodForm]);

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
    <div
      className={`page-detail page-padded ${
        oc.voiceSample ? "" : "no-voice-sample"
      }`}
    >
      {/* First row */}
      <div className="detail-block-image-view div-3d-with-shadow">
        <ZoomPanPinchImage
          src={currentDisplayAvatar}
          alt={oc.name}
          caption={currentDisplayAvatarCaption}
          contentWarning={currentDisplayAvatarContentWarning}
        />
      </div>
      <div className="detail-block-gallery div-3d-with-shadow">
        <div className="gallery-wrapper">
          <GalleryBlock
            gallery={oc.gallery}
            characterName={oc.name}
            onImageClick={(galleryItem) => {
              setCurrentDisplayAvatar(galleryItem.image);
              setCurrentDisplayAvatarCaption(galleryItem.caption || undefined);
              setCurrentDisplayAvatarContentWarning(
                galleryItem.contentWarning || undefined,
              );
            }}
          />
        </div>
      </div>
      {oc.voiceSample && (
        <div className="detail-block-voice-sample div-3d-with-shadow">
          <AudioPlayer src={oc.voiceSample} />
        </div>
      )}
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

        {/* Tab Interface - only show tabs if backstory exists */}
        {backstory && (
          <div className="detail-info-tabs">
            <button
              className={`detail-info-tab ${
                activeTab === "info" ? "active" : ""
              }`}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
            <button
              className={`detail-info-tab ${
                activeTab === "backstory" ? "active" : ""
              }`}
              onClick={() => setActiveTab("backstory")}
            >
              Backstory
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="detail-info-tab-content">
          {(!backstory || activeTab === "info") && (
            <BBCodeDisplay bbcode={oc.info} />
          )}
          {backstory && activeTab === "backstory" && (
            <BBCodeDisplay bbcode={backstory} />
          )}
          {activeTab === "backstory" && backstoryLoading && (
            <div>Loading backstory...</div>
          )}
        </div>
      </div>
      <div className="detail-block-species">
        <div className="div-3d-with-shadow detail-section-header">
          {displayButtonSpecies && (
            <ArrowButton
              direction="left"
              className="section-nav-button section-nav-button--left"
              onClick={() => speciesCarouselRef.current?.scrollPrev()}
            />
          )}
          <h2>Species</h2>
          {displayButtonSpecies && (
            <ArrowButton
              direction="right"
              className="section-nav-button section-nav-button--right"
              onClick={() => speciesCarouselRef.current?.scrollNext()}
            />
          )}
        </div>
        <div className="div-3d-with-shadow detail-section-content">
          <ImageWithInfoMany
            ref={speciesCarouselRef}
            items={oc.speciesDetails.map((species) => ({
              images: species.gallery,
              description: species.description,
              title: species.name,
              contentWarning: species.contentWarning,
            }))}
            showButtons={false}
          />
        </div>
      </div>
      <div className="detail-block-breadcrumbs">
        <div className="div-3d-with-shadow detail-section-header">
          {displayButtonBreadcrumbs && (
            <ArrowButton
              direction="left"
              className="section-nav-button section-nav-button--left"
              onClick={() => breadcrumbsCarouselRef.current?.scrollPrev()}
            />
          )}
          <h2>Breadcrumbs</h2>
          {displayButtonBreadcrumbs && (
            <ArrowButton
              direction="right"
              className="section-nav-button section-nav-button--right"
              onClick={() => breadcrumbsCarouselRef.current?.scrollNext()}
            />
          )}
        </div>
        <div className="div-3d-with-shadow detail-section-content">
          <ImageWithInfoMany
            ref={breadcrumbsCarouselRef}
            items={oc.breadcrumbs.map((breadcrumb) => ({
              images: breadcrumb.images,
              video: breadcrumb.video,
              description: breadcrumb.description,
              title: breadcrumb.title,
              contentWarning: breadcrumb.contentWarning,
            }))}
            showButtons={false}
          />
        </div>
      </div>

      <div className="detail-block-tags">
        {oc.tagDetails.map((tag, index) => (
          <span
            key={index}
            className="oc-detail-tag div-3d-with-shadow-borderless"
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
