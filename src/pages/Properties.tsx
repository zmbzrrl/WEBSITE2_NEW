import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessibleProperties, createProperty } from '../utils/newDatabase';
import { ProjectContext } from '../App';

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { setProjectCode } = useContext(ProjectContext);

  const [properties, setProperties] = useState<Array<{ prop_id: string; property_name: string; region: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newProperty, setNewProperty] = useState({ projectCode: '', propertyName: '', region: '' });
  const [saving, setSaving] = useState(false);

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
      setProperties(res.properties || []);
    } else {
      setError(res.error || 'Failed to load properties');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSelectProperty = (propId: string) => {
    setProjectCode(propId);
    navigate('/layouts');
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Select a Property</h2>
      <p style={{ color: '#666' }}>Choose a property to work in, or create a new one.</p>

      {error && (
        <div style={{ background: '#fdecea', color: '#611a15', border: '1px solid #f5c2c0', padding: '10px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#555' }}>{loading ? 'Loading properties…' : `${properties.length} properties`}</div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '8px 14px', background: '#1b92d1', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Create Property
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {properties.map((p) => (
          <div key={p.prop_id}
               onClick={() => onSelectProperty(p.prop_id)}
               style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: '#fafafa' }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.borderColor = '#1b92d1'; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{p.property_name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{p.region}</div>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{p.prop_id}</div>
          </div>
        ))}
      </div>

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
