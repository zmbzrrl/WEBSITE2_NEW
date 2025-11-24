import { useEffect, useMemo, useState } from 'react';

export type SocketTone = 'light' | 'dark';

const SOCKET_TONE_CACHE = new Map<string, SocketTone>();
const DEFAULT_COLOR = '#ffffff';

const normalizeHex = (color?: string) => {
  if (!color || typeof color !== 'string') {
    return DEFAULT_COLOR;
  }

  const trimmed = color.trim();
  if (!trimmed.startsWith('#')) {
    return DEFAULT_COLOR;
  }

  let hex = trimmed.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }

  if (hex.length < 6) {
    hex = hex.padEnd(6, '0');
  }

  return `#${hex.slice(0, 6)}`;
};

const computeHexBrightness = (color?: string) => {
  const normalized = normalizeHex(color);
  const hex = normalized.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000;
};

const classifySocketTone = (src: string): Promise<SocketTone> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve('dark');
  }

  return new Promise<SocketTone>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width || 1;
        canvas.height = image.height || 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('dark');
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let totalBrightness = 0;
        let countedPixels = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          const alpha = imageData[i + 3];
          if (alpha === 0) {
            continue;
          }
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          countedPixels += 1;
        }

        const averageBrightness = countedPixels === 0 ? 255 : totalBrightness / countedPixels;
        resolve(averageBrightness > 170 ? 'light' : 'dark');
      } catch {
        resolve('dark');
      }
    };

    image.onerror = () => resolve('dark');
  });
};

export const useSocketToneGuard = (
  icons: Record<string, { category?: string; src: string }> | null | undefined,
  backgroundColor?: string
) => {
  const [socketToneMap, setSocketToneMap] = useState<Record<string, SocketTone>>({});
  const [isToneReady, setIsToneReady] = useState(false);

  useEffect(() => {
    if (!icons || Object.keys(icons).length === 0) {
      setSocketToneMap({});
      setIsToneReady(false);
      return;
    }

    let cancelled = false;
    const socketEntries = Object.entries(icons).filter(
      ([, icon]) => icon && icon.category === 'Sockets'
    );

    if (!socketEntries.length) {
      setIsToneReady(true);
      return;
    }

    const cachedEntries = socketEntries
      .filter(([id]) => SOCKET_TONE_CACHE.has(id))
      .map(([id]) => [id, SOCKET_TONE_CACHE.get(id)!] as [string, SocketTone]);

    if (cachedEntries.length) {
      setSocketToneMap((prev) => ({ ...prev, ...Object.fromEntries(cachedEntries) }));
    }

    const toAnalyze = socketEntries.filter(([id]) => !SOCKET_TONE_CACHE.has(id));
    if (!toAnalyze.length) {
      setIsToneReady(true);
      return;
    }

    setIsToneReady(false);

    Promise.all(
      toAnalyze.map(async ([id, icon]) => {
        const tone = await classifySocketTone(icon.src);
        SOCKET_TONE_CACHE.set(id, tone);
        return [id, tone] as [string, SocketTone];
      })
    )
      .then((results) => {
        if (cancelled) return;
        setSocketToneMap((prev) => ({ ...prev, ...Object.fromEntries(results) }));
        setIsToneReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsToneReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [icons]);

  const requiredTone: SocketTone = useMemo(
    () => (computeHexBrightness(backgroundColor) < 150 ? 'dark' : 'light'),
    [backgroundColor]
  );

  const isSocketAllowed = useMemo(
    () => (iconId: string) => {
      const tone = socketToneMap[iconId];
      if (!tone) {
        return false;
      }
      return tone === requiredTone;
    },
    [socketToneMap, requiredTone]
  );

  const incompatibleSocketIds = useMemo(
    () =>
      new Set(
        Object.entries(socketToneMap)
          .filter(([, tone]) => tone !== requiredTone)
          .map(([id]) => id)
      ),
    [socketToneMap, requiredTone]
  );

  return {
    socketToneMap,
    isSocketAllowed,
    incompatibleSocketIds,
    requiredTone,
    isToneReady,
  };
};

