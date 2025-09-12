import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { getAccessibleProperties, createProperty, listPropertyRevisions, getDesignWithPermissions, createRevision, deleteLayout } from '../utils/newDatabase';
import { ProjectContext } from '../App';

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { setProjectCode } = useContext(ProjectContext);

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

  const [showCreate, setShowCreate] = useState(false);
  const [newProperty, setNewProperty] = useState({ projectCode: '', propertyName: '', region: '' });
  const [saving, setSaving] = useState(false);

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
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!userEmail) {
      setError('Please log in first.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const res = await getAccessibleProperties(userEmail);
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
          const revs = await listPropertyRevisions(userEmail, p.prop_id);
          if (revs.success) {
            nextRevisions[p.prop_id] = (revs.revisions || []).map((row: any) => ({
              id: row.id,
              name: row.name,
              createdAt: row.created_at,
              lastModified: row.last_modified,
              ownerEmail: row.user_email,
              propId: row.prop_id,
              data: row.data
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

  useEffect(() => { load(); }, []);

  const toggleExpanded = (propId: string) => {
    setExpanded(prev => ({ ...prev, [propId]: !prev[propId] }));
  };

  const onSelectProperty = (propId: string) => {
    // Expand/collapse handled by CSS hover; no navigation
    setProjectCode(propId);
  };

  const viewRevision = (propId: string, design: any) => {
    setProjectCode(propId);
    const panelConfigs = (design?.data?.panels && Array.isArray(design.data.panels)) ? design.data.panels : [];
    const state = {
      panelConfigs,
      projectName: design?.name || 'Project Design',
      projectCode: propId,
      revision: undefined
    } as any;
    navigate('/print-preview', { state });
  };

  const startNewDesign = (propId: string) => {
    setProjectCode(propId);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppProjectCode', propId);
      }
    } catch {}
    navigate('/panel-type');
  };

  const handleCreateRevision = async (propId: string, designId: string, designName: string) => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!userEmail) { setError('Please log in first.'); return; }
    const newName = parseNextRevisionName(designName);
    setRowBusy(prev => ({ ...prev, [designId]: 'creating' }));
    const res = await createRevision(designId, userEmail, propId, newName);
    if (!res.success) { setError(res.message || 'Failed to create revision'); setRowBusy(prev => ({ ...prev, [designId]: undefined })); return; }
    await load();
    setRowBusy(prev => ({ ...prev, [designId]: undefined }));
  };

  const handleEditRevision = (propId: string, design: any) => {
    setProjectCode(propId);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ppProjectCode', propId);
        sessionStorage.setItem('ppIsEditMode', 'true');
        sessionStorage.setItem('ppEditingDesignId', design.id);
        if (design?.name) sessionStorage.setItem('ppProjectName', design.name);
      }
    } catch {}
    navigate('/cart', {
      state: {
        projectEditMode: true,
        projectDesignId: design.id,
        projectOriginalName: design.name,
        projectCreateNewRevision: false,
        projectData: {
          projectName: design.name,
          projectCode: propId,
          panels: (design?.data?.panels && Array.isArray(design.data.panels)) ? design.data.panels : []
        }
      }
    });
  };

  const handleDeleteDesign = async (designId: string) => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!userEmail) { setError('Please log in first.'); return; }
    setRowBusy(prev => ({ ...prev, [designId]: 'deleting' }));
    const res = await deleteLayout(designId, userEmail);
    if (!res.success) { setError(res.message || 'Failed to delete'); setRowBusy(prev => ({ ...prev, [designId]: undefined })); return; }
    await load();
    setRowBusy(prev => ({ ...prev, [designId]: undefined }));
  };

  const canEditDelete = async (designId: string): Promise<boolean> => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    try {
      const res = await getDesignWithPermissions(designId, userEmail || '');
      return !!(res.success && res.permissions?.canEdit);
    } catch { return false; }
  };

  const onCreateProperty = async () => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!userEmail) {
      setError('Please log in first.');
      return;
    }
    const re = /^[A-Z]{2}-\d{4}-\d{4}$/;
    if (!re.test(newProperty.projectCode.trim().toUpperCase())) {
      setError('Project code must be like AE-4020-5678');
      return;
    }
    setSaving(true);
    const res = await createProperty(userEmail, {
      projectCode: newProperty.projectCode.trim().toUpperCase(),
      propertyName: newProperty.propertyName.trim(),
      region: newProperty.region.trim()
    });
    console.log('createProperty result:', res);
    setSaving(false);
    if (!res.success) {
      setError(res.message || 'Failed to create property');
      return;
    }
    setShowCreate(false);
    setNewProperty({ projectCode: '', propertyName: '', region: '' });
    await load();
  };

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
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd', background: '#fff' }}
            >
              <option value="All">All regions</option>
              {uniqueRegions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd', background: '#fff' }}
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
                        <div style={{ fontSize: 12, color: '#666' }}>{p.region}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.prop_id}</div>

                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e9ecef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 13, color: '#555' }}>Revisions</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 12, color: '#888' }}>
                              {loadingProp[p.prop_id] ? 'Loading…' : `${(revisionsByProp[p.prop_id] || []).length} items`}
                            </div>
                            <button
                              onClick={() => toggleExpanded(p.prop_id)}
                              title={expanded[p.prop_id] ? 'Hide revisions' : 'Show revisions'}
                              aria-label={expanded[p.prop_id] ? 'Collapse revisions' : 'Expand revisions'}
                              style={{
                                padding: 0,
                                background: 'transparent',
                                color: '#ccc',
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
                                  <div style={{ fontSize: 14, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                                  <div style={{ fontSize: 11, color: '#888' }}>Owner: {d.ownerEmail}</div>
                                  <div style={{ fontSize: 11, color: '#888' }}>Updated: {new Date(d.lastModified).toLocaleString()}</div>
                                </div>
                                {(() => {
                                  const currentUserEmail = (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '') || '';
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
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Project Code (e.g., AE-4020-5678)</label>
              <input value={newProperty.projectCode}
                     onChange={(e) => setNewProperty({ ...newProperty, projectCode: e.target.value.toUpperCase() })}
                     placeholder="AE-4020-5678"
                     style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Property Name</label>
              <input value={newProperty.propertyName}
                     onChange={(e) => setNewProperty({ ...newProperty, propertyName: e.target.value })}
                     placeholder="Marriott Palm Jumeirah"
                     style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Region</label>
              <input value={newProperty.region}
                     onChange={(e) => setNewProperty({ ...newProperty, region: e.target.value })}
                     placeholder="Dubai"
                     style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowCreate(false)}
                      style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onCreateProperty}
                      disabled={saving}
                      style={{ padding: '8px 12px', background: saving ? '#aaa' : '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
