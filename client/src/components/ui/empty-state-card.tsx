import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';

export interface EmptyStateCardProps {
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
  /** Additional classes to apply to the Card container */
  className?: string;
  /** Width of the card */
  width?: number;
  /** Height of the card */
  height?: number;
}

// A reusable empty-state card with dashed border, icon, and action button
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
  buttonIcon,
  className = '',
  width,
  height,
}) => {
  const showButton = buttonText && onButtonClick;
  const showDescription = description !== undefined && description !== '';
  const IconComponent = icon ?? <FilePlus className="h-12 w-12 text-muted-foreground mb-4" />;
  const ButtonIconComponent = buttonIcon ?? <FilePlus className="mr-2 h-4 w-4" />;

  return (
    <Card 
      className={`border-2 border-dashed ${className}`}
      style={{ width, height }}
    >
      <CardContent className="flex flex-col items-center justify-center py-10">
        {IconComponent}
        <h3 className="text-lg font-medium text-center">
          {title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()}
        </h3>
        {showDescription && (
          <p className="text-muted-foreground text-center mt-2 mb-4">
            {description}
          </p>
        )}
        {showButton && (
          <Button 
            onClick={onButtonClick}
            className="flex justify-center items-center"
          >
            {ButtonIconComponent}
            {buttonText.charAt(0).toUpperCase() + buttonText.slice(1).toLowerCase()}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
