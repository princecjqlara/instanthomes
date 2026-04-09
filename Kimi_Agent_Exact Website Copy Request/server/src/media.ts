import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function ensureCloudinaryConfigured() {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export async function uploadBrandLogo(fileBuffer: Buffer, tenantSlug: string, funnelSlug: string, originalName: string) {
  ensureCloudinaryConfigured();

  const extension = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.') + 1) : 'png';
  const publicId = `${tenantSlug}-${funnelSlug}-brand-logo`;

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'instanthomes/funnel-logos',
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        format: extension,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
}

export async function uploadFunnelMedia(fileBuffer: Buffer, tenantSlug: string, funnelSlug: string, originalName: string) {
  ensureCloudinaryConfigured();

  const extension = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.') + 1) : '';
  const isVideo = extension.match(/^(mp4|mov|webm|avi|mkv)$/i) !== null;
  const isImage = extension.match(/^(jpg|jpeg|png|webp|gif|svg)$/i) !== null;
  
  if (!isVideo && !isImage) {
     throw new Error('Unsupported file type');
  }

  return new Promise<{ url: string; type: 'image' | 'video'; thumbnailUrl: string | null; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `instanthomes/funnel-media/${tenantSlug}/${funnelSlug}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        const type = result.resource_type === 'video' ? 'video' : 'image';
        let thumbnailUrl = null;
        if (type === 'video') {
           // generate a fast thumbnail
           thumbnailUrl = cloudinary.url(result.public_id, { resource_type: 'video', format: 'jpg' });
        } else {
           thumbnailUrl = cloudinary.url(result.public_id, { width: 400, crop: 'scale' });
        }

        resolve({
          url: result.secure_url,
          type,
          thumbnailUrl,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
}

export async function deleteFunnelMedia(url: string) {
  ensureCloudinaryConfigured();
  
  // Extract public ID from the URL. Usually in format https://res.cloudinary.com/cloud_name/video/upload/v12345/folder/public_id.mp4
  const matches = url.match(/\/v\d+\/(.+?)\.[^.]+$/);
  if (!matches || !matches[1]) {
    return;
  }
  
  const publicId = matches[1];
  const resourceType = url.includes('/video/upload/') ? 'video' : 'image';
  
  return new Promise<void>((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
