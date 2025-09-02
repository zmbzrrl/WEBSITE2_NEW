import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Eagerly import all images from the design_guidelines folder
const imagesGlob = import.meta.glob('../assets/design_guidelines/*.{png,jpg,jpeg,svg}', {
  eager: true,
  as: 'url'
});

const designGuidelinesImages = Object.entries(imagesGlob)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url as string);

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '90vw',
    height: '90vh'
  }
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(33, 33, 33, 0.55)',
  color: '#fff',
  borderRadius: 12,
  backdropFilter: 'blur(6px)',
  boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
  padding: 8,
  '&:hover': {
    backgroundColor: 'rgba(33, 33, 33, 0.7)'
  }
}));

interface DesignGuidelinesProps {
  open: boolean;
  onClose: () => void;
}

const DesignGuidelines: React.FC<DesignGuidelinesProps> = ({ open, onClose }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ x: number; y: number } | null>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [prevExiting, setPrevExiting] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    setImages(designGuidelinesImages);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === '+') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key.toLowerCase() === 'r') resetZoom();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, currentIndex, scale, translate]);

  const prev = () => {
    if (!hasImages) return;
    setDirection('prev');
    setPrevImage(current);
    setEntering(true);
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    resetZoom();
  };

  const next = () => {
    if (!hasImages) return;
    setDirection('next');
    setPrevImage(current);
    setEntering(true);
    setCurrentIndex((i) => (i + 1) % images.length);
    resetZoom();
  };

  const zoomIn = () => setScale((s) => Math.min(4, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn(); else zoomOut();
    }
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (scale <= 1) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsPanning(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isPanning || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    setLastPointer({ x: e.clientX, y: e.clientY });
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setIsPanning(false);
    setLastPointer(null);
  };

  const hasImages = images.length > 0;
  const current = hasImages ? images[currentIndex] : '';

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    if (!hasImages) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    preload(images[nextIndex]);
    preload(images[prevIndex]);
  }, [currentIndex, images, hasImages]);

  // Trigger slide-out animation for previous image and cleanup
  useEffect(() => {
    if (!prevImage) return;
    setPrevExiting(false);
    const id = requestAnimationFrame(() => {
      setPrevExiting(true);
    });
    const timeout = setTimeout(() => {
      setPrevImage(null);
      setPrevExiting(false);
    }, 320);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(timeout);
    };
  }, [prevImage]);

  // After current changes, trigger entering transition to slide into place
  useEffect(() => {
    if (!entering) return;
    const id = requestAnimationFrame(() => {
      setEntering(false);
    });
    return () => cancelAnimationFrame(id);
  }, [entering, currentIndex]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="design-guidelines-dialog-title"
    >
      <DialogTitle id="design-guidelines-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            INTEREL Design Guidelines
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {hasImages ? (
          <Box position="relative" width="100%" height="70vh" display="flex" alignItems="center" justifyContent="center" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} sx={{ backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
            {prevImage && (
              <Box
                component="img"
                src={prevImage}
                alt="Previous slide"
                sx={{
                  position: 'absolute',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: prevExiting
                    ? `translate3d(${direction === 'next' ? -48 : 48}px, 0, 0) scale(${scale})`
                    : `translate3d(0, 0, 0) scale(${scale})`,
                  transition: 'transform 280ms ease',
                  willChange: 'transform',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
            )}
            <Box
              component="img"
              src={current}
              alt={`Design Guideline ${currentIndex + 1}`}
              sx={{
                position: 'absolute',
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `translate3d(calc(${translate.x}px + ${entering ? (direction === 'next' ? 48 : direction === 'prev' ? -48 : 0) : 0}px), calc(${translate.y}px + 0px), 0) scale(${scale})`,
                transformOrigin: 'center center',
                cursor: scale > 1 && isPanning ? 'grabbing' : scale > 1 ? 'grab' : 'default',
                userSelect: 'none',
                pointerEvents: 'auto',
                transition: isPanning ? 'none' : 'transform 280ms ease',
                willChange: 'transform'
              }}
              draggable={false}
            />

            <Box position="absolute" left={16} top={16} display="flex" gap={1}>
              <ControlButton size="medium" onClick={zoomOut} aria-label="zoom out">
                <ZoomOutIcon />
              </ControlButton>
              <ControlButton size="medium" onClick={resetZoom} aria-label="reset zoom">
                <RestartAltIcon />
              </ControlButton>
              <ControlButton size="medium" onClick={zoomIn} aria-label="zoom in">
                <ZoomInIcon />
              </ControlButton>
            </Box>

            <Box position="absolute" bottom={16} left={16}>
              <Typography variant="body2" color="white">{currentIndex + 1} / {images.length}</Typography>
            </Box>

            <Box position="absolute" left={16} top="50%" sx={{ transform: 'translateY(-50%)' }}>
              <ControlButton onClick={prev} aria-label="previous" sx={{ color: '#1976d2', backgroundColor: 'rgba(25,118,210,0.12)', '&:hover': { backgroundColor: 'rgba(25,118,210,0.2)' } }}>
                <ChevronLeftIcon />
              </ControlButton>
            </Box>
            <Box position="absolute" right={16} top="50%" sx={{ transform: 'translateY(-50%)' }}>
              <ControlButton onClick={next} aria-label="next" sx={{ color: '#1976d2', backgroundColor: 'rgba(25,118,210,0.12)', '&:hover': { backgroundColor: 'rgba(25,118,210,0.2)' } }}>
                <ChevronRightIcon />
              </ControlButton>
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            textAlign="center"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Design Guidelines Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please add images to the design_guidelines folder to see them here.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You can add PNG, JPG, or SVG files to src/assets/design_guidelines/
            </Typography>
          </Box>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default DesignGuidelines;
