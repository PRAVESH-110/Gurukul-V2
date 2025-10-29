// Example React component to upload up to 100MB directly to ImageKit
// npm i imagekitio-react imagekitio-js
import { useState } from 'react';
import ImageKit from 'imagekitio-js';

export default function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);

  async function getAuth() {
    const res = await fetch('/api/upload/imagekit-auth');
    return res.json();
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0]; 
    if (!file) return;
    if (file.size > 104857600) {
      alert('Max 100MB');
      return;
    }

    const auth = await getAuth();
    const ik = new ImageKit({
      publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
      authenticationEndpoint: '/api/upload/imagekit-auth'
    });

    const resp = await ik.upload({
      file,
      fileName: file.name,
      folder: '/gurukul/videos',
      tags: ['gurukul','video'],
      useUniqueFileName: true,
      responseFields: '*',
      // track progress
      onProgress: (evt) => {
        if (evt.lengthComputable) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      }
    });

    setUrl(resp.url);

    // Persist in backend
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name,
        description: '',
        url: resp.url,
        fileId: resp.fileId,
        size: file.size,
        communityId: 'REPLACE_WITH_COMMUNITY_ID'
      })
    });
  }

  return (
    <div>
      <input type="file" accept="video/*" onChange={onFileChange} />
      <div>Progress: {progress}%</div>
      {url && <a href={url} target="_blank">View Video</a>}
    </div>
  );
}
