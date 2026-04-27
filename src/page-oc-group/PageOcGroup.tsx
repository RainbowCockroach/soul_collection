import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import OcSlot from "../page-oc-list/OcSlot";
import OcGroupCover from "../page-oc-list/OcGroupCover";
import { loadAllData } from "../helpers/data-load";
import type { OC, Group, Ship } from "../helpers/objects";
import { useSafeMode } from "../safe-mode/SafeModeContext";
import { isOcCensored } from "../safe-mode/safe-mode-censor";
import LoadingSpinner from "../common-components/LoadingSpinner";
import BBCodeDisplay from "../common-components/BBCodeDisplay";
import "../page-oc-list/OcGroupCover.css";
import "../page-oc-list/PageOcList.css";
import "../page-oc-list/OcGroup.css";
import "./PageOcGroup.css";

const DEFAULT_FRAME_COLOUR = "#ffffff";
const DEFAULT_TEXT_COLOUR = "#000000";

const PageOcGroup: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isSafeModeEnabled } = useSafeMode();
  const [group, setGroup] = useState<Group | null>(null);
  const [ocs, setOcs] = useState<OC[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const { ocs, groups, ships } = await loadAllData();
        setGroup(groups.find((g) => g.slug === slug) ?? null);
        setOcs(ocs);
        setShips(ships);
      } catch (error) {
        console.error("Error loading OC data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const groupOcs = useMemo(
    () => (slug ? ocs.filter((oc) => oc.group.includes(slug)) : []),
    [ocs, slug],
  );

  const restrictedSlugs = useMemo(() => {
    if (!isSafeModeEnabled) return new Set<string>();
    return new Set(
      groupOcs.filter((oc) => isOcCensored(oc.slug)).map((oc) => oc.slug),
    );
  }, [isSafeModeEnabled, groupOcs]);

  const frameColour = group?.frameColour ?? DEFAULT_FRAME_COLOUR;
  const textColour = group?.groupHeaderTextColour ?? DEFAULT_TEXT_COLOUR;

  if (isLoading) {
    return <LoadingSpinner message="Loading group..." />;
  }

  if (!group) {
    return <div className="page-padded">Group not found.</div>;
  }

  return (
    <div className="page-padded page-oc-group">
      <div className="page-oc-group-header">
        <div className="page-oc-group-cover">
          <OcGroupCover
            groupInfo={{
              slug: group.slug,
              name: group.name,
              frameColour: group.frameColour,
              groupHeaderTextColour: group.groupHeaderTextColour,
              headerImage: group.headerImage,
            }}
          />
        </div>
        {group.description && (
          <div className="page-oc-group-description div-3d-with-shadow">
            <BBCodeDisplay bbcode={group.description} />
          </div>
        )}
      </div>

      <div className="oc-list-flat-content space-above">
        <div className="oc-group-grid">
          {groupOcs.map((oc) => (
            <OcSlot
              key={oc.slug}
              oc={{ slug: oc.slug, name: oc.name, avatar: oc.avatar }}
              frameColour={frameColour}
              textColour={textColour}
              shipColors={ships
                .filter((s) => s.oc.includes(oc.slug))
                .map((s) => s.color)}
              shipTexts={ships
                .filter((s) => s.oc.includes(oc.slug))
                .map((s) => s.shipText?.[oc.slug])
                .filter((t): t is string => !!t)}
              disabled={restrictedSlugs.has(oc.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageOcGroup;
