import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { getAccessibleProperties, createProperty, listPropertyRevisions, getDesignWithPermissions, createRevision, deleteLayout, deleteProperty } from '../utils/newDatabase';
import { ProjectContext } from '../App';
import { useUser } from '../contexts/UserContext';
import { importDatabaseDataNew, loadJsonFromFile, validateImportDataNew } from '../utils/databaseImporterNew';

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { setProjectCode, setProjectName, setLocation, setOperator } = useContext(ProjectContext);
  const { user } = useUser();

  const [properties, setProperties] = useState<Array<{ prop_id: string; property_name: string; region: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revisionsByProp, setRevisionsByProp] = useState<Record<string, any[]>>({});
  const [loadingProp, setLoadingProp] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, 'creating' | 'deleting' | undefined>>({});
  const [filterText, setFilterText] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<string>('name_asc');
  
  // Property deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ prop_id: string; property_name: string; region: string } | null>(null);
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newProperty, setNewProperty] = useState({ projectCode: '', propertyName: '', region: '' });
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  // JSON import UI state
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState<{ projectIds: string[]; results: any; propertyProjectNames: string[]; propertyProjectCodes: string[] } | null>(null);
  // BOQ import on new revision
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingBOQImport, setPendingBOQImport] = useState(false);
  const [showBoqImportModal, setShowBoqImportModal] = useState(false);
  const [boqDragActive, setBoqDragActive] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setImportError('');
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError('Please drop a .json file');
      return;
    }
    setImporting(true);
    try {
      const json = await loadJsonFromFile(file as any);
      const v = validateImportDataNew(json as any);
      if (!v.valid) { setImportError(`Validation failed: ${v.errors.join(', ')}`); setImporting(false); return; }
      // Add user email to the JSON data for import
      const jsonWithUser = { ...json, user_email: user?.email };
      const res = await importDatabaseDataNew(jsonWithUser as any);
      if (!res.success || !res.results) { setImportError(res.message || 'Import failed'); setImporting(false); return; }
      if (!res.results.project_ids || res.results.project_ids.length === 0) {
        const errs = (res.results as any).errors || [];
        setImportError(`Import completed but no projects were created. ${errs.length ? `Errors: ${errs.join(' | ')}` : ''}`.trim());
        setImporting(false);
        return;
      }
      // Show success popup with options
      console.log('✅ Import completed successfully');
      // Extract property/project names and codes from the original JSON
      let propertyProjectNames: string[] = [];
      let propertyProjectCodes: string[] = [];
      const jsonData = json as any; // Type assertion for flexible JSON structure
      
      if (jsonData.properties && Array.isArray(jsonData.properties)) {
        propertyProjectNames = jsonData.properties.map((p: any) => p.property_name).filter(Boolean);
        propertyProjectCodes = jsonData.properties.map((p: any) => p.property_code || p.property_id).filter(Boolean);
      } else if (jsonData.project_name) {
        propertyProjectNames = [jsonData.project_name];
        propertyProjectCodes = [jsonData.project_code || jsonData.project_id || ''];
      } else if (jsonData.projects && Array.isArray(jsonData.projects)) {
        propertyProjectNames = jsonData.projects.map((p: any) => p.project_name).filter(Boolean);
        propertyProjectCodes = jsonData.projects.map((p: any) => p.project_code || p.project_id).filter(Boolean);
      } else if (jsonData['Property name']) {
        // Handle colleague proposal format
        propertyProjectNames = [jsonData['Property name']];
        propertyProjectCodes = [jsonData['Property code'] || ''];
      }
      
      setImportSuccess({
        projectIds: res.results.project_ids || [],
        results: res.results,
        propertyProjectNames,
        propertyProjectCodes
      });
      
      // Close the create dialog
      setShowCreate(false);
      
      // Refresh the properties list in background
      try {
        await load(); // Reload the properties list to show the new property
      } catch (loadErr) {
        console.warn('Failed to refresh properties list after import:', loadErr);
        // Don't show error to user since import was successful
      }
    } catch (err: any) {
      setImportError(err?.message || 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const parseNextRevisionName = (currentName?: string) => {
    const name = (currentName || 'Design').trim();
    const m = name.match(/^(.*)\(rev(\d+)\)\s*$/i);
    if (m) {
      const base = m[1].trim();
      const n = parseInt(m[2], 10);
      const next = isNaN(n) ? 0 : n + 1;
      return `${base} (rev${next})`;
    }
    // If no rev present, treat current as rev0 and create rev1
    const base = name.replace(/\s*\(rev\d+\)$/i, '').trim();
    return `${base} (rev1)`;
  };

  const load = async () => {
    if (!user?.email) {
      setError('Please log in first.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const res = await getAccessibleProperties(user.email);
    console.log('getAccessibleProperties result:', res);
    if (res.success) {
      const props = res.properties || [];
      setProperties(props);
      // Initialize expanded state to expanded by default, and preserve existing entries
      setExpanded(prev => {
        const next: Record<string, boolean> = { ...prev };
        props.forEach((p: any) => {
          if (typeof next[p.prop_id] === 'undefined') {
            next[p.prop_id] = false; // collapsed by default
          }
        });
        return next;
      });
      // Load revisions for each property
      const nextRevisions: Record<string, any[]> = {};
      const nextLoading: Record<string, boolean> = {};
      setLoadingProp(props.reduce((acc: Record<string, boolean>, p: any) => { acc[p.prop_id] = true; return acc; }, {}));
      for (const p of props) {
        try {
          const revs = await listPropertyRevisions(user?.email, p.prop_id);
          if (revs.success) {
            nextRevisions[p.prop_id] = (revs.revisions || []).map((row: any) => ({
              id: row.id,
              name: row.name || row.design_name,
              createdAt: row.created_at,
              lastModified: row.last_modified,
              ownerEmail: row.user_email,
              propId: row.prop_id,
              data: row.data || row.design_data
            }));
          } else {
            nextRevisions[p.prop_id] = [];
          }
        } catch {
          nextRevisions[p.prop_id] = [];
        } finally {
          nextLoading[p.prop_id] = false;
        }
      }
      setRevisionsByProp(nextRevisions);
      setLoadingProp(nextLoading);
    } else {
      setError(res.error || 'Failed to load properties');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const toggleExpanded = (propId: string) => {
    setExpanded(prev => ({ ...prev, [propId]: !prev[propId] }));
  };

  const onSelectProperty = (propId: string) => {
    // Expand/collapse handled by CSS hover; no navigation
    setProjectCode(propId);
  };

  const viewRevision = (propId: string, design: any) => {
    setProjectCode(propId);
    const designData = design?.data || design?.design_data || {};
    const panelConfigs = (designData?.panels && Array.isArray(designData.panels)) ? designData.panels : [];
    const state = {
      panelConfigs,
      projectName: design?.name || design?.design_name || 'Project Design',
      projectCode: propId,
      revision: undefined
    } as any;
    navigate('/print-preview', { state });
  };

  const startNewDesign = (propId: string) => {
    console.log('Starting new design for property:', propId);
    setProjectCode(propId);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppProjectCode', propId);
        console.log('Set sessionStorage ppProjectCode to:', propId);
        // Set BOQ context to the selected property so the panel selector loads its designs
        sessionStorage.setItem('boqProjectIds', JSON.stringify([propId]));
        console.log('Set sessionStorage boqProjectIds to:', JSON.stringify([propId]));
      }
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
    console.log('Navigating to /panel-type with BOQ projectIds');
    navigate('/panel-type', { state: { projectIds: [propId] } });
  };

  const handleCreateRevision = async (propId: string, designId: string, designName: string) => {
    const userEmail = user?.email || null;
    if (!userEmail) { setError('Please log in first.'); return; }
    const newName = parseNextRevisionName(designName);
    setRowBusy(prev => ({ ...prev, [designId]: 'creating' }));
    const res = await createRevision(designId, userEmail, propId, newName);
    if (!res.success) { setError(res.message || 'Failed to create revision'); setRowBusy(prev => ({ ...prev, [designId]: undefined })); return; }
    await load();
    setRowBusy(prev => ({ ...prev, [designId]: undefined }));
    // Open BOQ import modal directly
    setShowBoqImportModal(true);
  };

  // Handle BOQ JSON selection after creating a revision
  const handleBOQFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try { (e.target as any).value = null; } catch {}
    if (!file) { setPendingBOQImport(false); return; }
    await processBoqFile(file);
  };

  // Shared processor for chosen or dropped files
  const processBoqFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) { alert('Please select a .json file'); setPendingBOQImport(false); return; }
    try {
      const json = await loadJsonFromFile(file as any);
      const v = validateImportDataNew(json as any);
      if (!v.valid) { alert(`Validation failed: ${v.errors.join(', ')}`); setPendingBOQImport(false); return; }
      const jsonWithUser = { ...(json as any), user_email: user?.email };
      const res = await importDatabaseDataNew(jsonWithUser as any);
      if (!res.success || !res.results) { alert(res.message || 'Import failed'); setPendingBOQImport(false); return; }
      if (!res.results.project_ids || res.results.project_ids.length === 0) {
        const errs = (res.results as any).errors || [];
        alert(`Import completed but no projects were created. ${errs.length ? `Errors: ${errs.join(' | ')}` : ''}`);
        setPendingBOQImport(false);
        return;
      }
      try {
        sessionStorage.setItem('boqProjectIds', JSON.stringify(res.results.project_ids));
        sessionStorage.setItem('boqImportResults', JSON.stringify(res.results));
      } catch {}
      setShowBoqImportModal(false);
      navigate('/panel-type', { state: { projectIds: res.results.project_ids } });
    } catch (err: any) {
      alert(err?.message || 'Failed to import file');
    } finally {
      setPendingBOQImport(false);
    }
  };

  // Drag and drop handlers for BOQ modal
  const handleBoqDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBoqDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processBoqFile(file);
  };
  const handleBoqDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setBoqDragActive(true); };
  const handleBoqDragLeave = () => setBoqDragActive(false);

  const handleEditRevision = (propId: string, design: any) => {
    setProjectCode(propId);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppProjectCode', propId);
        sessionStorage.setItem('ppIsEditMode', 'true');
        sessionStorage.setItem('ppEditingDesignId', design.id);
        const resolvedName = design?.name || design?.design_name;
        if (resolvedName) sessionStorage.setItem('ppProjectName', resolvedName);
      }
    } catch {}
    const designData = design?.data || design?.design_data || {};
    navigate('/proj-panels', {
      state: {
        editMode: true,
        designId: design.id,
        projectData: {
          projectName: (design?.name || design?.design_name || 'Project Design'),
          projectCode: propId,
          panels: (designData?.panels && Array.isArray(designData.panels)) ? designData.panels : []
        }
      }
    });
  };

  const handleDeleteDesign = async (designId: string) => {
    const userEmail = user?.email || null;
    if (!userEmail) { setError('Please log in first.'); return; }
    setRowBusy(prev => ({ ...prev, [designId]: 'deleting' }));
    const res = await deleteLayout(designId, userEmail);
    if (!res.success) { setError(res.message || 'Failed to delete'); setRowBusy(prev => ({ ...prev, [designId]: undefined })); return; }
    await load();
    setRowBusy(prev => ({ ...prev, [designId]: undefined }));
  };

  const canEditDelete = async (designId: string): Promise<boolean> => {
    const userEmail = user?.email || '';
    try {
      const res = await getDesignWithPermissions(designId, userEmail || '');
      return !!(res.success && res.permissions?.canEdit);
    } catch { return false; }
  };

  const handleDeleteProperty = (property: { prop_id: string; property_name: string; region: string }) => {
    setPropertyToDelete(property);
    setShowDeleteConfirm(true);
    setConfirmationText('');
  };

  const proceedToFinalConfirmation = () => {
    if (!propertyToDelete) return;
    setShowDeleteConfirm(false);
    setShowFinalConfirm(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete || !user?.email) return;
    
    // Check if user typed the confirmation text correctly
    const expectedText = `DELETE ${propertyToDelete.property_name}`;
    if (confirmationText !== expectedText) {
      setError('Please type the exact confirmation text to proceed');
      return;
    }
    
    setDeletingProperty(true);
    setError('');
    
    try {
      const result = await deleteProperty(propertyToDelete.prop_id, user.email);
      
      if (result.success) {
        // Close the modal first to update UI immediately
        setShowFinalConfirm(false);
        setPropertyToDelete(null);
        setConfirmationText('');
        setDeletingProperty(false);
        
        // Immediately remove the deleted property from local state
        setProperties(prevProperties => 
          prevProperties.filter(p => p.prop_id !== propertyToDelete.prop_id)
        );
        
        // Also refresh the properties list to ensure consistency
        try {
          await load();
        } catch (loadErr) {
          console.warn('Failed to refresh properties list:', loadErr);
          // Don't show error to user since deletion was successful and we already updated local state
        }
      } else {
        setError(result.message || 'Failed to permanently delete property');
        setDeletingProperty(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to permanently delete property');
      setDeletingProperty(false);
    }
  };

  const cancelDeleteProperty = () => {
    setShowDeleteConfirm(false);
    setShowFinalConfirm(false);
    setPropertyToDelete(null);
    setConfirmationText('');
    setError('');
  };

  // Manual creation removed; data will be taken from JSON import only

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 30, display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: 40, width: 'auto', cursor: 'pointer', filter: 'brightness(0) invert(1)' }}
          onClick={() => navigate('/')}
        />
      </div>

      <p style={{ color: '#fff', marginTop: 45 }}>Choose a property to work in, or create a new one.</p>

      {error && (
        <div style={{ background: '#fdecea', color: '#611a15', border: '1px solid #f5c2c0', padding: '10px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#fff' }}>{loading ? 'Loading properties…' : `${properties.length} properties`}</div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '8px 14px', background: '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Create Property
        </button>
      </div>

      {/* Filters & Sorting */}
      {(() => {
        const uniqueRegions = Array.from(new Set(properties.map(p => p.region).filter(Boolean))).sort((a, b) => a.localeCompare(b));
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 200px',
            gap: 12,
            marginBottom: 16,
            alignItems: 'center'
          }}>
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by property name or code"
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
            >
              <option value="All">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
            >
              <option value="name_asc">Sort: Name (A→Z)</option>
              <option value="name_desc">Sort: Name (Z→A)</option>
              <option value="region_asc">Sort: Region (A→Z)</option>
              <option value="region_desc">Sort: Region (Z→A)</option>
              <option value="revisions_desc">Sort: Most revisions</option>
              <option value="updated_desc">Sort: Recently updated</option>
            </select>
          </div>
        );
      })()}

      {/* Group by region so regions are the top-level category */}
      {(() => {
        // Apply filters
        const filtered = properties.filter(p => {
          const regionOk = regionFilter === 'All' || p.region === regionFilter;
          const text = filterText.trim().toLowerCase();
          const textOk = text === '' || p.property_name.toLowerCase().includes(text) || p.prop_id.toLowerCase().includes(text);
          return regionOk && textOk;
        });

        // Prepare helpers for sort keys that depend on revisions
        const getRevCount = (propId: string) => (revisionsByProp[propId] || []).length;
        const getLatestUpdated = (propId: string) => {
          const arr = revisionsByProp[propId] || [];
          if (arr.length === 0) return 0;
          return Math.max(...arr.map((d: any) => new Date(d.lastModified).getTime() || 0));
        };

        // Sort properties according to sortKey (before grouping, region header order stays alphabetical)
        const sorted = [...filtered].sort((a, b) => {
          switch (sortKey) {
            case 'name_asc': return a.property_name.localeCompare(b.property_name);
            case 'name_desc': return b.property_name.localeCompare(a.property_name);
            case 'region_asc': return a.region.localeCompare(b.region) || a.property_name.localeCompare(b.property_name);
            case 'region_desc': return b.region.localeCompare(a.region) || a.property_name.localeCompare(b.property_name);
            case 'revisions_desc': return getRevCount(b.prop_id) - getRevCount(a.prop_id);
            case 'updated_desc': return getLatestUpdated(b.prop_id) - getLatestUpdated(a.prop_id);
            default: return a.property_name.localeCompare(b.property_name);
          }
        });

        const grouped: Record<string, typeof sorted> = sorted.reduce((acc: Record<string, typeof sorted>, p) => {
          const key = p.region || 'Other';
          if (!acc[key]) acc[key] = [] as any;
          (acc[key] as any).push(p);
          return acc;
        }, {} as any);
        const regions = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
        return (
          <div style={{ display: 'grid', gap: 24 }}>
            {regions.map((region) => (
              <div key={region}>
                <div style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  margin: '8px 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span>{region}</span>
                  <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>({grouped[region].length})</span>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {grouped[region].map((p) => (
                    <div key={p.prop_id}
                         style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa' }}
                         onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.borderColor = '#1b92d1'; }}
                         onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{p.property_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 12, color: '#666' }}>{p.region}</div>
                          <button
                            onClick={() => handleDeleteProperty(p)}
                            title="Delete property"
                            style={{
                              padding: '4px 8px',
                              background: '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 500
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.prop_id}</div>

                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e9ecef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 13, color: '#555' }}>Revisions</div>
                            <button
                              onClick={() => toggleExpanded(p.prop_id)}
                              title={expanded[p.prop_id] ? 'Hide revisions' : 'Show revisions'}
                              aria-label={expanded[p.prop_id] ? 'Collapse revisions' : 'Expand revisions'}
                              style={{
                                padding: 0,
                                background: 'transparent',
                                color: '#888',
                                border: 'none',
                                cursor: 'pointer',
                                transform: expanded[p.prop_id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 120ms ease',
                                fontSize: 14,
                                lineHeight: 1
                              }}
                            >
                              ▶
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 12, color: '#888' }}>
                              {loadingProp[p.prop_id] ? 'Loading…' : `${(revisionsByProp[p.prop_id] || []).length} items`}
                            </div>
                            {(!loadingProp[p.prop_id] && (revisionsByProp[p.prop_id] || []).length === 0) && (
                              <button
                                onClick={() => startNewDesign(p.prop_id)}
                                title="Create a brand new design"
                                style={{ padding: '6px 10px', background: '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                              >
                                New Design
                              </button>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gap: 8,
                            marginTop: 8,
                            overflow: 'hidden',
                            transition: 'max-height 200ms ease, opacity 180ms ease',
                            maxHeight: expanded[p.prop_id] ? 1200 : 0,
                            opacity: expanded[p.prop_id] ? 1 : 0,
                          }}
                        >
                          {((revisionsByProp[p.prop_id] || []).length === 0 && !loadingProp[p.prop_id]) && (
                            <div style={{ background: '#fff', border: '1px dashed #d0d0d0', borderRadius: 6, padding: 14, textAlign: 'center', color: '#666' }}>
                              No revisions yet. Start by creating your first design for this property.
                            </div>
                          )}
                          {(revisionsByProp[p.prop_id] || []).map((d) => (
                            <div key={d.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                                    <span style={{
                                      fontSize: 11,
                                      padding: '2px 6px',
                                      borderRadius: 10,
                                      border: '1px solid',
                                      borderColor: (d?.data?.isEdited ? '#1e7e34' : '#6c757d'),
                                      color: (d?.data?.isEdited ? '#1e7e34' : '#6c757d'),
                                      background: 'transparent'
                                    }}>
                                      {d?.data?.isEdited ? 'Edited' : 'Unedited'}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#888' }}>Owner: {d.ownerEmail}</div>
                                  <div style={{ fontSize: 11, color: '#888' }}>Updated: {new Date(d.lastModified).toLocaleString()}</div>
                                </div>
                                {(() => {
                                  const currentUserEmail = user?.email || '';
                                  const isOwner = currentUserEmail && currentUserEmail === d.ownerEmail;
                                  const busy = rowBusy[d.id];
                                  return (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                      <button
                                        onClick={() => viewRevision(p.prop_id, d)}
                                        title="View revision"
                                        style={{ padding: '6px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => !busy && handleCreateRevision(p.prop_id, d.id, d.name)}
                                        title="Create revision from this"
                                        disabled={!!busy}
                                        style={{ padding: '6px 10px', background: busy ? '#d29a6b' : '#e67e22', color: '#fff', border: 'none', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.8 : 1 }}
                                      >
                                        {busy === 'creating' ? 'Creating…' : 'New Revision'}
                                      </button>
                                      {isOwner && (
                                        <>
                                          <button
                                            onClick={() => handleEditRevision(p.prop_id, d)}
                                            title="Edit current revision"
                                            style={{ padding: '6px 10px', background: '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => !busy && handleDeleteDesign(d.id)}
                                            title="Delete (owner only)"
                                            disabled={!!busy}
                                            style={{ padding: '6px 10px', background: busy ? '#c96b63' : '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.8 : 1 }}
                                          >
                                            {busy === 'deleting' ? 'Deleting…' : 'Delete'}
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: '90%', maxWidth: 520 }}>
            <h3 style={{ marginTop: 0 }}>Create Property</h3>

            {/* Manual Create Form */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#333' }}>Project Code (unique)</span>
                <input
                  value={newProperty.projectCode}
                  onChange={(e) => setNewProperty(p => ({ ...p, projectCode: e.target.value.trim() }))}
                  style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#333' }}>Property Name</span>
                <input
                  value={newProperty.propertyName}
                  onChange={(e) => setNewProperty(p => ({ ...p, propertyName: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#333' }}>Region</span>
                <input
                  value={newProperty.region}
                  onChange={(e) => setNewProperty(p => ({ ...p, region: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
              </label>
              {createError && (
                <div style={{ background: '#fdecea', color: '#611a15', border: '1px solid #f5c2c0', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>{createError}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowCreate(false)}
                        disabled={saving}
                        style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>Close</button>
                <button
                  onClick={async () => {
                    if (!user?.email) { setCreateError('Please log in first.'); return; }
                    setCreateError('');
                    if (!newProperty.projectCode || !newProperty.propertyName || !newProperty.region) {
                      setCreateError('Please fill all fields.');
                      return;
                    }
                    setSaving(true);
                    try {
                      const res = await createProperty(user.email, {
                        projectCode: newProperty.projectCode,
                        propertyName: newProperty.propertyName,
                        region: newProperty.region
                      });
                      if (!res.success) {
                        setCreateError(res.message || 'Failed to create property');
                        setSaving(false);
                        return;
                      }
                      // Persist context/session to mirror import path
                      setProjectCode(newProperty.projectCode);
                      setProjectName(newProperty.propertyName);
                      try {
                        sessionStorage.setItem('ppProjectCode', newProperty.projectCode);
                        sessionStorage.setItem('ppProjectName', newProperty.propertyName);
                        // No BOQ projectIds yet; user can design freely
                      } catch {}
                      // Refresh list but also navigate to design selector for immediate workflow
                      try { await load(); } catch {}
                      setShowCreate(false);
                      navigate('/panel-type');
                    } catch (e: any) {
                      setCreateError(e?.message || 'Unexpected error');
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  style={{ padding: '8px 14px', background: saving ? '#7aaacf' : '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Creating…' : 'Create Property'}
                </button>
              </div>
            </div>

            <hr style={{ margin: '16px 0' }} />
            <h4 style={{ margin: '0 0 8px 0' }}>Or Import from JSON</h4>
            {/* JSON Import Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${dragActive ? '#1b92d1' : '#ddd'}`,
                borderRadius: 8,
                padding: 16,
                background: dragActive ? '#f0f8ff' : '#fafafa',
                marginBottom: 12,
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop JSON to seed property/projects</div>
              <div style={{ fontSize: 12, color: '#666' }}>Drag and drop a .json file here</div>
              {importing && <div style={{ marginTop: 8, fontSize: 12, color: '#1b92d1' }}>Importing…</div>}
              {importError && <div style={{ marginTop: 8, fontSize: 12, color: '#c0392b' }}>{importError}</div>}
            </div>
          </div>
        </div>
      )}

      {/* First Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
            <h3 style={{ marginTop: 0, color: '#e74c3c' }}>⚠️ Delete Property</h3>
            <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{propertyToDelete?.property_name}</strong>?
            </p>
            <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 6, padding: 12, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#856404' }}>
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 14, color: '#856404' }}>
                <li>All designs and revisions in this property</li>
                <li>All access permissions for this property</li>
                <li>The property itself</li>
              </ul>
              <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#856404' }}>
                <strong>This action cannot be undone and will remove all data from the database.</strong>
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={cancelDeleteProperty}
                style={{ 
                  padding: '10px 16px', 
                  background: '#f5f5f5', 
                  border: '1px solid #ddd', 
                  borderRadius: 4, 
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={proceedToFinalConfirmation}
                style={{ 
                  padding: '10px 16px', 
                  background: '#e74c3c', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer'
                }}
              >
                Continue to Final Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Dialog */}
      {showFinalConfirm && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
            <h3 style={{ marginTop: 0, color: '#c0392b' }}>🔥 FINAL CONFIRMATION</h3>
            <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
              You are about to <strong>permanently delete</strong> <strong>{propertyToDelete?.property_name}</strong> from the database.
            </p>
            <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 6, padding: 12, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#721c24' }}>
                <strong>⚠️ CRITICAL WARNING:</strong> This action will:
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 14, color: '#721c24' }}>
                <li><strong>Permanently remove</strong> all designs and revisions</li>
                <li><strong>Permanently remove</strong> all access permissions</li>
                <li><strong>Permanently remove</strong> the property from database</li>
                <li><strong>Cannot be undone</strong> - no recovery possible</li>
              </ul>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600 }}>
                To confirm deletion, type: <strong>DELETE {propertyToDelete?.property_name}</strong>
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type: DELETE ${propertyToDelete?.property_name}`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>
            {error && (
              <div style={{ background: '#fdecea', color: '#611a15', border: '1px solid #f5c2c0', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={cancelDeleteProperty}
                disabled={deletingProperty}
                style={{ 
                  padding: '10px 16px', 
                  background: '#f5f5f5', 
                  border: '1px solid #ddd', 
                  borderRadius: 4, 
                  cursor: deletingProperty ? 'not-allowed' : 'pointer',
                  opacity: deletingProperty ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProperty}
                disabled={deletingProperty || confirmationText !== `DELETE ${propertyToDelete?.property_name}`}
                style={{ 
                  padding: '10px 16px', 
                  background: deletingProperty ? '#c96b63' : (confirmationText === `DELETE ${propertyToDelete?.property_name}` ? '#c0392b' : '#bdc3c7'), 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: (deletingProperty || confirmationText !== `DELETE ${propertyToDelete?.property_name}`) ? 'not-allowed' : 'pointer',
                  opacity: (deletingProperty || confirmationText !== `DELETE ${propertyToDelete?.property_name}`) ? 0.8 : 1
                }}
              >
                {deletingProperty ? 'Deleting...' : 'PERMANENTLY DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Success Popup */}
      {importSuccess && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500, textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#155724' }}>
              Import Successful!
            </h3>
            <p style={{ margin: '0 0 20px 0', fontWeight: 'bold', fontSize: '18px', color: '#155724' }}>
              {importSuccess.propertyProjectNames.length > 0 
                ? `${importSuccess.propertyProjectNames.join(', ')} imported successfully !`
                : 'Property imported successfully !'
              }
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button
                onClick={() => {
                  // Set project code and name in context and session storage (same as New Design flow)
                  const propId = importSuccess.projectIds[0]; // Database property ID (for internal use)
                  const projectName = importSuccess.propertyProjectNames[0] || 'Imported Project'; // Use first property name
                  const projectCode = importSuccess.propertyProjectCodes[0] || propId; // Use property code from JSON, fallback to DB ID
                  
                  console.log('🔍 Import Success Debug:');
                  console.log('  importSuccess.propertyProjectCodes:', importSuccess.propertyProjectCodes);
                  console.log('  importSuccess.propertyProjectNames:', importSuccess.propertyProjectNames);
                  console.log('  propId (DB ID):', propId);
                  console.log('  projectName:', projectName);
                  console.log('  projectCode:', projectCode);
                  
                  setProjectCode(projectCode); // Use the property code from JSON, not the DB ID
                  setProjectName(projectName);
                  
                  try {
                    sessionStorage.setItem('ppProjectCode', projectCode);
                    sessionStorage.setItem('ppProjectName', projectName);
                    sessionStorage.setItem('boqProjectIds', JSON.stringify(importSuccess.projectIds));
                    sessionStorage.setItem('boqImportResults', JSON.stringify(importSuccess.results));
                    console.log('  Saved to sessionStorage - ppProjectCode:', projectCode, 'ppProjectName:', projectName);
                  } catch {}
                  navigate('/panel-type', {
                    state: {
                      projectIds: importSuccess.projectIds,
                      projectName: projectName,
                      projectCode: projectCode
                    }
                  });
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                Start Designing
              </button>
              
              <button
                onClick={() => setImportSuccess(null)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#545b62'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOQ Import Modal for New Revision */}
      {showBoqImportModal && (
        <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: '90%', maxWidth: 520 }}>
            <h3 style={{ marginTop: 0 }}>Import BOQ JSON for New Revision</h3>
            <div
              onDrop={handleBoqDrop}
              onDragOver={handleBoqDragOver}
              onDragLeave={handleBoqDragLeave}
              style={{
                border: `2px dashed ${boqDragActive ? '#1b92d1' : '#ddd'}`,
                borderRadius: 8,
                padding: 16,
                background: boqDragActive ? '#f0f8ff' : '#fafafa',
                marginBottom: 12,
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop your BOQ .json here</div>
              <div style={{ fontSize: 12, color: '#666' }}>or click the button below</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowBoqImportModal(false)}
                      style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Skip</button>
              <button onClick={() => { setPendingBOQImport(true); fileInputRef.current?.click(); }}
                      style={{ padding: '8px 12px', background: '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                {pendingBOQImport ? 'Opening…' : 'Choose BOQ JSON'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for BOQ import on new revision */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleBOQFileSelected}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Properties;

