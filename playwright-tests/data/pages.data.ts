export interface SitePage {
  name: string;
  path: string;
  title: string;
  heroTextContains: string;
}

export const homePageData: SitePage = {
  name: 'home',
  path: '/',
  title: 'Growth Partner | Marketing Digital',
  heroTextContains: 'crecimiento',
};
