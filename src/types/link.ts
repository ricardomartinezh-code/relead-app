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

export interface LinkPageWithContent {
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
  design: any;
  createdAt: string;
  updatedAt: string;
}
