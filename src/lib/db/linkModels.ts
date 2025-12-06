export interface LinkPage {
  id: string;
  userId: string;
  internalName: string;
  slug: string;
  publicTitle: string | null;
  publicDescription: string | null;
  isDefault: boolean;
  isPublished: boolean;
  design: any;
  createdAt: string;
  updatedAt: string;
}

export interface LinkBlock {
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
