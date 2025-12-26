// 🔍 DATABASE INSPECTOR PAGE
// This page helps you view and understand your database structure

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../utils/supabaseClient';

interface TableInfo {
  schema: string;
  name: string;
  rowCount: number;
  columns: string[];
}

const DatabaseInspector: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | false>(false);

  const inspectDatabase = async () => {
    setLoading(true);
    setError(null);
    setTables([]);

    try {
      // Common table names to check
      const tableNames = [
        'users',
        'property',
        'ug',
        'user_projects',
        'user_designs',
        'panel_configurations',
        'design_versions',
        'layouts',
      ];

      const foundTables: TableInfo[] = [];

      for (const tableName of tableNames) {
        try {
          // Try to get row count
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (!countError) {
            // Try to get one row to see structure
            const { data, error: dataError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);

            const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

            foundTables.push({
              schema: 'public', // Assume public schema
              name: tableName,
              rowCount: count || 0,
              columns,
            });
          }
        } catch (err) {
          // Table doesn't exist or can't access - skip it
          console.log(`Table ${tableName} not found or inaccessible`);
        }
      }

      setTables(foundTables);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect database');
      console.error('Database inspection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-inspect on mount
    inspectDatabase();
  }, []);

  const handleTableChange = (tableName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTable(isExpanded ? tableName : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 400, fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
        🔍 Database Inspector
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={inspectDatabase}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Refresh Database Inspection'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {tables.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No tables found. Click "Refresh Database Inspection" to scan for tables.
        </Alert>
      )}

      {tables.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Found {tables.length} Table{tables.length !== 1 ? 's' : ''}
          </Typography>

          {tables.map((table) => (
            <Accordion
              key={table.name}
              expanded={expandedTable === table.name}
              onChange={handleTableChange(table.name)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif', fontWeight: 500 }}>
                    {table.schema}.{table.name}
                  </Typography>
                  <Chip
                    label={`${table.rowCount} row${table.rowCount !== 1 ? 's' : ''}`}
                    size="small"
                    color={table.rowCount > 0 ? 'primary' : 'default'}
                  />
                  <Chip
                    label={`${table.columns.length} column${table.columns.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif', fontWeight: 500 }}>
                          Column Name
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.columns.length > 0 ? (
                        table.columns.map((column) => (
                          <TableRow key={column}>
                            <TableCell sx={{ fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
                              {column}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell>No columns found (table might be empty)</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
          📝 How to Share Your Database Structure
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
          To get comprehensive database inspection results:
        </Typography>
        <Box component="ol" sx={{ pl: 3 }}>
          <li style={{ marginBottom: '8px', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Go to your Supabase dashboard → SQL Editor
          </li>
          <li style={{ marginBottom: '8px', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Open the file <code>inspect-database-complete.sql</code> from your project
          </li>
          <li style={{ marginBottom: '8px', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Copy and paste the entire SQL script into the SQL Editor
          </li>
          <li style={{ marginBottom: '8px', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Click "Run" to execute the script
          </li>
          <li style={{ marginBottom: '8px', fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif' }}>
            Copy all the results and share them with me
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default DatabaseInspector;

