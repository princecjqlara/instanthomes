import type { ComponentType } from 'react';
import type { FunnelRecord } from '@/types/platform';

export type TemplateFieldKey = 'name' | 'headline' | 'subheadline' | 'primaryCtaLabel' | 'propertyAddress' | 'propertyPrice';

export interface TemplateFieldDefinition {
  key: TemplateFieldKey;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  helperText?: string;
}

export interface TemplateRenderProps {
  funnel: FunnelRecord;
}

export interface TemplateDefinition {
  key: string;
  name: string;
  description: string;
  editorFields: TemplateFieldDefinition[];
  component: ComponentType<TemplateRenderProps>;
}
