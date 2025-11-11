export interface PortalPageEntity {
  applicationName: string;
  children: PortalPageEntity[];
  contentGuid: string;
  contentId: number;
  contentReference: string | null;
  contentUrl: string;
  departments: string | null;
  hasChildren: boolean;
  name: string;
  pageAccessTypes: any[];
  selected: boolean;
  category: string | null;
}
