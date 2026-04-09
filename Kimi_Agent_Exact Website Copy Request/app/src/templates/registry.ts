import { KimiExactTemplate } from '@/templates/kimi-exact-v1';
import { InstantListingTemplate } from '@/templates/instant-listing-v2';
import type { TemplateDefinition } from '@/templates/types';

const sharedFields = [
  {
    key: 'name',
    label: 'Funnel name',
    type: 'text',
    placeholder: 'Laurel Ridge Launch',
    helperText: 'Internal funnel label shown across the tenant dashboard.',
  },
  {
    key: 'headline',
    label: 'Headline',
    type: 'text',
    placeholder: 'Tour the property before public launch.',
  },
  {
    key: 'subheadline',
    label: 'Subheadline',
    type: 'textarea',
    placeholder: 'Give buyers the high-level promise of this funnel.',
  },
  {
    key: 'primaryCtaLabel',
    label: 'Primary CTA label',
    type: 'text',
    placeholder: 'Book a private showing',
  },
  {
    key: 'propertyAddress',
    label: 'Property address',
    type: 'text',
    placeholder: '1848 Laurel Ridge Drive, Austin, TX 78704',
  },
  {
    key: 'propertyPrice',
    label: 'Property price',
    type: 'text',
    placeholder: '$1,485,000',
  },
] satisfies TemplateDefinition['editorFields'];

const templateRegistry: Record<string, TemplateDefinition> = {
  'kimi-exact-v1': {
    key: 'kimi-exact-v1',
    name: 'Kimi Exact v1',
    description: 'The provided premium real-estate funnel adapted from the source landing page.',
    editorFields: sharedFields,
    component: KimiExactTemplate,
  },
  'instant-listing-v2': {
    key: 'instant-listing-v2',
    name: 'Instant Listing v2',
    description: 'A tighter editorial layout focused on one property, one CTA, and one branded conversion path.',
    editorFields: sharedFields,
    component: InstantListingTemplate,
  },
};

export function listTemplates() {
  return Object.values(templateRegistry);
}

export function getTemplateDefinition(templateKey: string) {
  return templateRegistry[templateKey];
}
