import React from "react";
import {
  extractYouTubeId,
  isValidYouTubeId,
  validateScale,
} from "../utilities";
import type { YoutubeData } from "../types";
import type { StyleTheme } from "../../../application/types/StyleTheme";
import { ALIGNMENT_CLASSES, SPACING_CLASSES } from "../constants";

interface Props {
  youtubeData: YoutubeData;
  styles: StyleTheme; // <- to style caption like ImageBlock does
}

const YoutubeBlock: React.FC<Props> = ({ youtubeData, styles }) => {
  const validatedScale = validateScale(youtubeData.scale);
  const widthPercent = `${Math.min(1, Math.max(0, validatedScale)) * 100}%`;

  const extractedId = extractYouTubeId(youtubeData.youtubeVideoId);
  const validId =
    extractedId && isValidYouTubeId(extractedId) ? extractedId : null;

  if (!validId) return null;

  const alignKey = (youtubeData.alignment ??
    "left") as keyof typeof ALIGNMENT_CLASSES;
  const containerAlign = ALIGNMENT_CLASSES[alignKey].container; // mr-auto | mx-auto | ml-auto
  const textAlign = ALIGNMENT_CLASSES[alignKey].text; // text-left | text-center | text-right

  return (
    <div className={`${SPACING_CLASSES.medium} ${textAlign}`}>
      <div
        className={`${containerAlign} block`}
        style={{ width: widthPercent }}
      >
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${validId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border"
          />
        </div>

        {/* Caption (like ImageBlock’s renderCaption) */}
        {youtubeData.caption ? (
          <p className={`mt-2 ${styles.text.alternative}`}>
            {youtubeData.caption}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default YoutubeBlock;
