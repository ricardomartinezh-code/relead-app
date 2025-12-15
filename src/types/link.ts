export interface LinkPageBackground {
  type?: "solid" | "gradient" | "image";
  solidColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  imageUrl?: string;
  imageOpacity?: number;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface LinkPageTypography {
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
  fontFamily?: "system" | "sans" | "serif" | "mono";
}

export interface LinkPageDesign {
  background?: LinkPageBackground;

  buttonBg?: string;
  buttonText?: string;
  textColor?: string;
  accentColor?: string;

  header?: {
    template?: "classic" | "minimal";
    useProfileAvatar?: boolean;
    useProfileName?: boolean;
    useProfileBio?: boolean;
    showSocialLinks?: boolean;
  };

  typography?: LinkPageTypography;
}

export interface LinkItem {
  id: string;
  blockId: string;
  position: number;
  label: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
  isActive: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface LinkBlockWithItems {
  id: string;
  pageId: string;
  blockType: string;
  title: string | null;
  subtitle: string | null;
  position: number;
  isVisible: boolean;
  config: any;
  createdAt: string;
  updatedAt: string;
  items: LinkItem[];
}

export interface BlockStyleConfig {
  variant?: "default" | "soft" | "solid" | "outline";
  emphasis?: "low" | "normal" | "high";
  corner?: "md" | "lg" | "xl" | "pill";
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export interface LinkPageWithContent {
  id: string;
  userId: string;
  internalName: string;
  slug: string;
  publicTitle: string | null;
  publicDescription: string | null;
  isDefault: boolean;
  isPublished: boolean;
  design: LinkPageDesign | null;
  createdAt: string;
  updatedAt: string;
  blocks: LinkBlockWithItems[];
}

export interface LinkPageSummary {
  id: string;
  userId: string;
  internalName: string;
  slug: string;
  publicTitle: string | null;
  publicDescription: string | null;
  isDefault: boolean;
  isPublished: boolean;
  design: LinkPageDesign | null;
  createdAt: string;
  updatedAt: string;
}
