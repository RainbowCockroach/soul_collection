import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import heightChartData from "../data/height-chart.json";
import heightChartGodlyData from "../data/height-chart-godly.json";
import {
  isInHeightChart,
  toggleHeightChartSelection,
} from "../helpers/height-chart-cart";
import SenseBreakButton from "../sense-break/SenseBreakButton";
import { useSafeMode } from "../safe-mode/SafeModeContext";
import {
  isOcCensored,
  isTagCensored,
} from "../safe-mode/safe-mode-censor";
import ButtonWrapper from "../common-components/ButtonWrapper";
import LoadingSpinner from "../common-components/LoadingSpinner";
import buttonSoundHover from "/sound-effect/button_hover.mp3";
import buttonSound from "/sound-effect/button_oc_slot.mp3";
import buttonSoundGallery from "/sound-effect/button_gallery_item.mp3";
import buttonSoundTabSwitch from "/sound-effect/button_tab_switch_info_backstory.mp3";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSafeModeEnabled, toggleSafeMode } = useSafeMode();
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
  const [addedToHeightChart, setAddedToHeightChart] = useState(false);

  // Find the first variant ID for this OC in each height chart
  const mortalChartVariantId = heightChartData.find(
    (group) => group.groupId === slug,
  )?.variants[0]?.id;
  const godlyChartVariantId = heightChartGodlyData.find(
    (group) => group.groupId === slug,
  )?.variants[0]?.id;

  const hasAnyHeightChart = !!(mortalChartVariantId || godlyChartVariantId);

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
    const inMortal = mortalChartVariantId
      ? isInHeightChart(mortalChartVariantId, "mortal")
      : false;
    const inGodly = godlyChartVariantId
      ? isInHeightChart(godlyChartVariantId, "godly")
      : false;
    setAddedToHeightChart(inMortal || inGodly);
  }, [mortalChartVariantId, godlyChartVariantId]);

  const handleAddToHeightChart = () => {
    if (!hasAnyHeightChart) return;
    // Toggle all charts this OC appears in
    let nowAdded = false;
    if (mortalChartVariantId) {
      nowAdded = toggleHeightChartSelection(mortalChartVariantId, "mortal");
    }
    if (godlyChartVariantId) {
      nowAdded = toggleHeightChartSelection(godlyChartVariantId, "godly");
    }
    setAddedToHeightChart(nowAdded);
  };

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
    return <LoadingSpinner message="Loading character..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!oc) {
    return <div>Character not found</div>;
  }

  if (isSafeModeEnabled && isOcCensored(oc.slug)) {
    return (
      <div className="page-padded safe-mode-block">
        <h1 className="safe-mode-block-title">Beware!</h1>
        <p className="safe-mode-block-message">
          This OC might be too spicy for your delicate eyes and sanity. Didn't
          you read ALL the content warnings?
        </p>
        <div className="safe-mode-block-buttons">
          <ButtonWrapper
            className="div-3d-with-shadow safe-mode-block-btn safe-mode-block-btn--allow"
            onClick={() => toggleSafeMode()}
            hoverSoundFile={buttonSoundHover}
            soundFile={buttonSound}
          >
            Calloused, won't complain, let me in!
          </ButtonWrapper>
          <ButtonWrapper
            className="div-3d-with-shadow safe-mode-block-btn safe-mode-block-btn--back"
            onClick={() => navigate("/soul_collection/ocs")}
            hoverSoundFile={buttonSoundHover}
            soundFile={buttonSound}
          >
            Scary, take me home
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`page-detail page-padded ${
        oc.voiceSample ? "" : "no-voice-sample"
      } ${hasAnyHeightChart ? "has-height-chart-btn" : ""}`}
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
      {(oc.voiceSample || hasAnyHeightChart) && (
        <div className="detail-voice-height-row">
          {oc.voiceSample && (
            <div className="detail-block-voice-sample div-3d-with-shadow">
              <AudioPlayer src={oc.voiceSample} />
            </div>
          )}
          {hasAnyHeightChart && (
            <div className="detail-block-height-chart-btn div-3d-with-shadow">
              <ButtonWrapper
                className={`detail-height-chart-btn${addedToHeightChart ? " added" : ""}`}
                onClick={handleAddToHeightChart}
                soundFile={buttonSoundGallery}
              >
                {addedToHeightChart ? "Added" : "Add to height chart"}
              </ButtonWrapper>
            </div>
          )}
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
            <ButtonWrapper
              className={`detail-info-tab ${
                activeTab === "info" ? "active" : ""
              }`}
              onClick={() => setActiveTab("info")}
              soundFile={buttonSoundTabSwitch}
              hoverSoundFile={buttonSoundHover}
            >
              Info
            </ButtonWrapper>
            <ButtonWrapper
              className={`detail-info-tab ${
                activeTab === "backstory" ? "active" : ""
              }`}
              onClick={() => setActiveTab("backstory")}
              soundFile={buttonSoundTabSwitch}
              hoverSoundFile={buttonSoundHover}
            >
              Backstory
            </ButtonWrapper>
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
            <LoadingSpinner message="Loading backstory..." size="small" />
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
        {oc.tagDetails
          .filter((tag) => !isSafeModeEnabled || !isTagCensored(tag.slug))
          .map((tag, index) => (
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

      {!isSafeModeEnabled && (slug === "bush" || slug === "vhhz") && (
        <SenseBreakButton chance={0.1} />
      )}
    </div>
  );
};

export default PageDetail;
