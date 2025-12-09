export interface FileNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  ext?: string; // 文件扩展名
  children?: FileNode[];
}

// 文件图标映射
export const fileIcons: Record<string, string> = {
  // 文件夹
  folder: 'folder',
  // 文件类型图标
  vue: 'document',
  ts: 'document',
  js: 'document',
  json: 'document',
  html: 'document',
  css: 'document',
  md: 'document',
  txt: 'document',
  jpg: 'picture',
  png: 'picture',
  gif: 'picture',
  svg: 'picture',
  ico: 'picture',
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  xls: 'document',
  xlsx: 'document',
  ppt: 'document',
  pptx: 'document',
  zip: 'folder',
  rar: 'folder',
  '7z': 'folder',
  tar: 'folder',
  gz: 'folder',
  // 默认图标
  default: 'document'
};