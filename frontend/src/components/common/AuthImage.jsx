import React, { useEffect, useState } from "react";
import api from "../../utils/axios";

const AuthImage = ({ filename, alt = "", className = "", style }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!filename) {
      setSrc(null);
      return undefined;
    }

    let objectUrl;
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get(
          `/files/${encodeURIComponent(filename)}`,
          { responseType: "blob" }
        );
        objectUrl = URL.createObjectURL(response.data);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc(null);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  if (!src) {
    return <div className={className} style={style} />;
  }

  return <img src={src} alt={alt} className={className} style={style} />;
};

export default AuthImage;
