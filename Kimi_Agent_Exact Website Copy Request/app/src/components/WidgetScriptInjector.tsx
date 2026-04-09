import { useEffect } from 'react';

const IM_APP_URL = import.meta.env.VITE_INSTANT_MEETING_URL ?? 'http://localhost:3000';

interface WidgetScriptInjectorProps {
  widgetKey: string;
  funnelId?: string;
  funnelSlug?: string;
  tenantSlug?: string;
  propertyAddress?: string;
  propertyPrice?: string;
}

function setMeta(name: string, content: string | undefined) {
  if (!content) {
    return;
  }

  let tag = document.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function removeMeta(name: string) {
  const tag = document.querySelector(`meta[name="${name}"]`);

  if (tag) {
    tag.remove();
  }
}

/**
 * Injects the InstantMeeting widget script on published funnel pages.
 * Adds meta tags providing funnel context so the IM widget can send
 * enhanced visitor metadata (property info, funnel IDs, etc.).
 */
export function WidgetScriptInjector({
  widgetKey,
  funnelId,
  funnelSlug,
  tenantSlug,
  propertyAddress,
  propertyPrice,
}: WidgetScriptInjectorProps) {
  useEffect(() => {
    if (!widgetKey) {
      return;
    }

    // Set context meta tags
    setMeta('ih-funnel-id', funnelId);
    setMeta('ih-funnel-slug', funnelSlug);
    setMeta('ih-tenant-slug', tenantSlug);
    setMeta('ih-property-address', propertyAddress);
    setMeta('ih-property-price', propertyPrice);

    // Inject the IM widget script
    const script = document.createElement('script');
    script.src = `${IM_APP_URL}/widget/im.js`;
    script.dataset.key = widgetKey;
    script.dataset.source = 'instanthomes';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      removeMeta('ih-funnel-id');
      removeMeta('ih-funnel-slug');
      removeMeta('ih-tenant-slug');
      removeMeta('ih-property-address');
      removeMeta('ih-property-price');
    };
  }, [widgetKey, funnelId, funnelSlug, tenantSlug, propertyAddress, propertyPrice]);

  return null;
}
