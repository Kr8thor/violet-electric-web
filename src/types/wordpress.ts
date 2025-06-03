export interface WordPressPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  categories: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

export interface WordPressPage {
  id: string;
  title: string;
  content: string;
  slug: string;
  uri: string;
}

export interface WordPressSettings {
  title: string;
  description: string;
  url: string;
}

export interface WordPressMenu {
  menuItems: {
    nodes: Array<{
      id: string;
      label: string;
      url: string;
      uri: string;
    }>;
  };
}

export interface WordPressMediaItem {
  id: string;
  sourceUrl: string;
  altText: string;
  title: string;
  mediaType: string;
}
