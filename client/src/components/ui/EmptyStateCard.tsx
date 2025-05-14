import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps {
  /** Main heading text */
  title: string;
  /** Subheading or descriptive text */
  description?: string;
  /** Text to display inside the button */
  buttonText?: string;
  /** Click handler for the button */
  onButtonClick?: () => void;
  /** Optional custom icon at the top */
  icon?: React.ReactNode;
  /** Optional custom icon inside the button */
  buttonIcon?: React.ReactNode;
  /** Additional classes to apply to the container */
  className?: string;
  /** Width of the card */
  width?: number;
  /** Height of the card */
  height?: number;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
  buttonIcon,
  className = "",
  width = 356,
  height = 251,
}) => {
  const showButton = buttonText && onButtonClick;
  const showIcon = icon !== undefined;
  const showDescription = description !== undefined && description !== "";

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        <rect
          x={1}
          y={1}
          width={width - 2}
          height={height - 2}
          rx={24}
          stroke="#35343A"
          strokeWidth={1}
          strokeDasharray="16 16"
          fill="transparent"
        />
      </svg>
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 text-center">
        {showIcon && <div className="flex justify-center">{icon}</div>}
        <h3 className="text-lg font-medium text-center">{title}</h3>
        {showDescription && (
          <p className="text-muted-foreground text-center mt-2 mb-4">
            {description}
          </p>
        )}
        {showButton && (
          <div className="flex justify-center">
            <Button onClick={onButtonClick}>
              {buttonIcon}
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyStateCard; 