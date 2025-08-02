import React from "react";
import {
  extractYouTubeId,
  isValidYouTubeId,
  validateScale,
} from "../utilities";

interface Props {
  youtubeVideoId: string; // can be raw ID or full URL
  scale?: number;
}

const YoutubeBlock: React.FC<Props> = ({ youtubeVideoId, scale }) => {
  const validatedScale = validateScale(scale);
  const widthPercent = `${validatedScale * 100}%`;

  const extractedId = extractYouTubeId(youtubeVideoId);
  const validId =
    extractedId && isValidYouTubeId(extractedId) ? extractedId : null;

  if (!validId) {
    return null; // or show fallback
  }

  return (
    <div className="mb-6 text-center">
      <div className="mx-auto" style={{ width: widthPercent }}>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${validId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border"
          />
        </div>
      </div>
    </div>
  );
};

export default YoutubeBlock;
