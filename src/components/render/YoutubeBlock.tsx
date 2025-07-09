import React from "react";

interface YoutubeBlockProps {
  youtubeVideoId: string;
  scale?: number;
}

const YoutubeBlock: React.FC<YoutubeBlockProps> = ({
  youtubeVideoId,
  scale = 1.0,
}) => {
  const isValidScale = !isNaN(scale) && scale > 0;
  const widthPercent = `${(isValidScale ? scale : 1) * 100}%`;

  return (
    <div className="mb-6 text-center">
      <div className="mx-auto" style={{ width: widthPercent }}>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
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
