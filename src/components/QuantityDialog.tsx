import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

type PanelCategory = 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT';

interface QuantityDialogProps {
  open: boolean;
  category: PanelCategory;
  remaining?: number; // undefined means unlimited
  onCancel: () => void;
  onConfirm: (qty: number) => void;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({ open, category, remaining, onCancel, onConfirm }) => {
  const [value, setValue] = useState<number>(1);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setValue(1);
    setError('');
  }, [open]);

  const min = 1;
  const max = typeof remaining === 'number' ? Math.max(1, remaining) : undefined;

  const validate = (v: number) => {
    if (!Number.isFinite(v) || v < min) return `Minimum is ${min}`;
    if (typeof max === 'number' && v > max) return `Maximum is ${max}`;
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    setValue(Number.isFinite(v) ? v : 1);
    setError(validate(Number.isFinite(v) ? v : 1));
  };

  const adjust = (delta: number) => {
    const next = value + delta;
    const clamped = typeof max === 'number' ? Math.min(Math.max(next, min), max) : Math.max(next, min);
    setValue(clamped);
    setError(validate(clamped));
  };

  const handleConfirm = () => {
    const err = validate(value);
    if (err) {
      setError(err);
      return;
    }
    onConfirm(value);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Allocate BOQ Quantity</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          How much of the BOQ's input quantity does this design represent?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
          Category: {category} {typeof remaining === 'number' ? `(Available: ${remaining})` : '(Unlimited)'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <IconButton aria-label="decrease" onClick={() => adjust(-1)} disabled={value <= min} size="small">
            <RemoveIcon />
          </IconButton>
          <TextField
            type="number"
            value={value}
            onChange={handleChange}
            inputProps={{ min, max }}
            error={!!error}
            helperText={error || ' '}
            sx={{ width: 120 }}
          />
          <IconButton aria-label="increase" onClick={() => adjust(1)} disabled={typeof max === 'number' ? value >= max : false} size="small">
            <AddIcon />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">Allocate Quantity</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuantityDialog;


