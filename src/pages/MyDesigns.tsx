// 📚 MY DESIGNS PAGE - Hierarchical Organization
// Organized by: Location → Operator/Service Partner → Project Name + Code

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Folder as FolderIcon
} from '@mui/icons-material';

// 🗂️ Import our database functions
import { getDesigns, deleteDesign } from '../utils/database';
import { useCart } from '../contexts/CartContext';
import { mockSendEmail } from '../utils/mockBackend';
import { useContext } from 'react';
import { ProjectContext } from '../App';

// 🏪 STYLED COMPONENTS
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
  padding: theme.spacing(3),
  fontFamily: 'sans-serif'
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  color: 'white'
}));

const LocationAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(2, 0),
  }
}));

const OperatorAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(248, 249, 250, 0.95)',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(1, 0),
  }
}));

const ProjectAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(1, 0),
  }
}));

const RevisionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(248, 249, 250, 0.95)',
  borderRadius: '6px',
  boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  }
}));

// 🎯 MAIN COMPONENT
const MyDesigns: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setProjectName, setProjectCode, setLocation, setOperator, setAllowedPanelTypes } = useContext(ProjectContext);
  const { setServicePartner } = useContext(ProjectContext) as any;
  
  const [designs, setDesigns] = useState<any[]>([]);
  const [organizedDesigns, setOrganizedDesigns] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSalesManager, setShowSalesManager] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const userEmail = localStorage.getItem('userEmail') || 'test@example.com';
  
  // Project details state
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    location: '',
    projectCode: '',
    salesManager: '',
    operator: '',
    servicePartner: '',
    email: userEmail
  });
  
  useEffect(() => {
    loadDesigns();
  }, []);
  
  // 📋 Load all designs for the current user
  const loadDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getDesigns(userEmail);
      
      if (result.success && result.designs) {
        const transformedDesigns = result.designs.map((design: any) => ({
          id: design.id,
          projectName: design.design_name || design.user_projects?.project_name || 'Untitled Design',
          panelType: design.panel_type,
          createdAt: design.created_at,
          lastModified: design.last_modified,
          designData: design.design_data,
          projectId: design.project_id
        }));
        
        setDesigns(transformedDesigns);
        organizeDesigns(transformedDesigns);
        console.log(`📚 Loaded ${transformedDesigns.length} designs for ${userEmail}`);
      } else {
        setError('Failed to load designs');
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      setError('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };
  
  // 🗂️ Organize designs hierarchically
  const organizeDesigns = (designs: any[]) => {
    const organized: any = {};
    
    console.log('🔍 Organizing designs:', designs.length);
    
    designs.forEach(design => {
      // Extract location, operator, and project info from design data
      const location = extractLocation(design);
      const operator = extractOperator(design);
      const projectInfo = extractProjectInfo(design);
      
      console.log('🔍 Design:', design.projectName);
      console.log('  Location:', location);
      console.log('  Operator:', operator);
      console.log('  Project Key:', projectInfo.key);
      console.log('  Project Name:', projectInfo.name);
      
      // Create hierarchical structure
      if (!organized[location]) {
        organized[location] = {};
      }
      
      if (!organized[location][operator]) {
        organized[location][operator] = {};
      }
      
      if (!organized[location][operator][projectInfo.key]) {
        organized[location][operator][projectInfo.key] = {
          name: projectInfo.name,
          code: projectInfo.code,
          revisions: {}
        };
        console.log('✅ Created new project:', projectInfo.key);
      }
      
      // Group by revision
      const revisionNumber = extractRevisionNumber(design.projectName);
      const revisionKey = `rev${revisionNumber}`;
      
      if (!organized[location][operator][projectInfo.key].revisions[revisionKey]) {
        organized[location][operator][projectInfo.key].revisions[revisionKey] = {
          revision: revisionNumber,
          designs: []
        };
        console.log('✅ Created new revision:', revisionKey);
      }
      
      organized[location][operator][projectInfo.key].revisions[revisionKey].designs.push(design);
    });
    
    console.log('🔍 Final organized structure:', organized);
    setOrganizedDesigns(organized);
  };

  // 🗺️ Extract location from design data
  const extractLocation = (design: any): string => {
    // First try to get location from the project data in the database (if fields exist)
    if (design.user_projects?.location) {
      return design.user_projects.location;
    }
    
    // Try to extract from design data (this is where the actual input data will be)
    if (design.designData?.location) {
      return design.designData.location;
    }
    
    // Custom project mapping - you can add your specific projects here
    const projectName = design.projectName || '';
    const customLocationMap: { [key: string]: string } = {
      // Add your specific project names and their locations here
      'Sample Hotel Project': 'Dubai',
      'Palm Jumeirah Resort': 'Dubai',
      'London Business Hotel': 'London',
      'Tokyo Tower Hotel': 'Tokyo',
      'New York Downtown': 'New York',
      // Add more mappings as needed
    };
    
    // Check custom mapping first
    for (const [projectKey, location] of Object.entries(customLocationMap)) {
      if (projectName.includes(projectKey)) {
        return location;
      }
    }
    
    // Try to extract from project name as fallback
    if (projectName.includes('Dubai')) return 'Dubai';
    if (projectName.includes('London')) return 'London';
    if (projectName.includes('New York')) return 'New York';
    if (projectName.includes('Singapore')) return 'Singapore';
    if (projectName.includes('Tokyo')) return 'Tokyo';
    if (projectName.includes('Paris')) return 'Paris';
    if (projectName.includes('Sydney')) return 'Sydney';
    if (projectName.includes('Toronto')) return 'Toronto';
    
    // Default location - only use this if no other data is available
    return 'Other Locations';
  };

  // 🏢 Extract operator/service partner from design data
  const extractOperator = (design: any): string => {
    // First try to get operator from the project data in the database (if fields exist)
    if (design.user_projects?.operator) {
      return design.user_projects.operator;
    }
    
    // Try service partner as alternative (if field exists)
    if (design.user_projects?.service_partner) {
      return design.user_projects.service_partner;
    }
    
    // Try to extract from design data (this is where the actual input data will be)
    if (design.designData?.operator) {
      return design.designData.operator;
    }
    
    if (design.designData?.servicePartner) {
      return design.designData.servicePartner;
    }
    
    // Custom project mapping - you can add your specific projects here
    const projectName = design.projectName || '';
    const customOperatorMap: { [key: string]: string } = {
      // Add your specific project names and their operators here
      'Sample Hotel Project': 'Marriott Hotels',
      'Palm Jumeirah Resort': 'Marriott Hotels',
      'London Business Hotel': 'Hilton Group',
      'Tokyo Tower Hotel': 'Hyatt Hotels',
      'New York Downtown': 'InterContinental Hotels Group',
      // Add more mappings as needed
    };
    
    // Check custom mapping first
    for (const [projectKey, operator] of Object.entries(customOperatorMap)) {
      if (projectName.includes(projectKey)) {
        return operator;
      }
    }
    
    // Try to extract from project name as fallback
    if (projectName.includes('Marriott')) return 'Marriott Hotels';
    if (projectName.includes('Hilton')) return 'Hilton Group';
    if (projectName.includes('Hyatt')) return 'Hyatt Hotels';
    if (projectName.includes('InterContinental')) return 'InterContinental Hotels Group';
    if (projectName.includes('Accor')) return 'Accor Hotels';
    if (projectName.includes('Wyndham')) return 'Wyndham Hotels';
    if (projectName.includes('Choice')) return 'Choice Hotels';
    if (projectName.includes('Best Western')) return 'Best Western Hotels';
    
    // Default operator - only use this if no other data is available
    return 'Other Operators';
  };

  // 📋 Extract project name and code from design data
  const extractProjectInfo = (design: any): { key: string; name: string; code: string } => {
    const projectName = design.projectName || 'Untitled Project';
    
    // Get project code from design data (what user entered)
    const projectCode = design.designData?.projectCode || '';
    
    // Strip revision number from project name for grouping
    const baseProjectName = projectName.replace(/\s*\(rev\d+\)$/, '');
    
    // Create a unique key for the project (without revision)
    // Use base project name only if no project code exists
    const key = projectCode ? `${baseProjectName}_${projectCode}` : baseProjectName;
    
    return {
      key,
      name: baseProjectName, // Use base name without revision
      code: projectCode
    };
  };

  // 🔢 Extract revision number from project name
  const extractRevisionNumber = (projectName: string): number => {
    const revisionMatch = projectName.match(/\(rev(\d+)\)$/);
    return revisionMatch ? parseInt(revisionMatch[1]) : 0;
  };

  // 🗑️ Delete a design
  const handleDeleteDesign = async (designId: string) => {
    try {
      const result = await deleteDesign(userEmail, designId);
      
      if (result.success) {
        setDesigns(designs.filter(d => d.id !== designId));
        organizeDesigns(designs.filter(d => d.id !== designId));
        console.log(`🗑️ Deleted design ${designId}`);
      } else {
        setError('Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting design:', error);
      setError('Failed to delete design');
    }
  };
  
  // ✏️ Edit a design
  const handleEditDesign = (design: any) => {
    console.log('Editing design:', design);
    
    const designData = design.designData;
    
    if (design.panelType === 'Project') {
      navigate('/cart', { 
        state: { 
          editMode: true,
          projectData: JSON.parse(JSON.stringify(designData)),
          designId: design.id,
          projectDesignId: design.id, // Add this for project-level edit tracking
          projectEditMode: true, // Add this for project-level edit tracking
          projectOriginalName: design.projectName // Add this for project-level edit tracking
        }
      });
    } else {
      const panelTypeToRoute: { [key: string]: string } = {
        'SP': '/customizer/sp',
        'DPH': '/customizer/dph',
        'DPV': '/customizer/dpv',
        'X1H': '/customizer/x1h',
        'X2H': '/customizer/x2h',
        'X2V': '/customizer/x2v',
        'X1V': '/customizer/x1v',
        'TAG': '/customizer/tag',
        'IDPG': '/customizer/idpg'
      };
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        // Don't add to cart for editing - let the customizer handle it
        navigate(customizerPath, { 
          state: { 
            editMode: true,
            panelData: JSON.parse(JSON.stringify(designData)),
            designId: design.id,
            projectDesignId: design.id, // Add this for project-level edit tracking
            projectEditMode: true, // Add this for project-level edit tracking
            projectOriginalName: design.projectName, // Add this for project-level edit tracking
            panelIndex: 0,
            isEditing: true
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        navigate('/panel-type');
      }
    }
  };

  // 👁️ View design (read-only mode)
  const handleViewDesign = (design: any) => {
    console.log('Viewing design:', design);
    
    const designData = design.designData;
    
    if (design.panelType === 'Project') {
      navigate('/cart', { 
        state: { 
          viewMode: true,
          projectData: JSON.parse(JSON.stringify(designData)),
          designId: design.id
        }
      });
    } else {
      const panelTypeToRoute: { [key: string]: string } = {
        'SP': '/customizer/sp',
        'DPH': '/customizer/dph',
        'DPV': '/customizer/dpv',
        'X1H': '/customizer/x1h',
        'X2H': '/customizer/x2h',
        'X2V': '/customizer/x2v',
        'X1V': '/customizer/x1v',
        'TAG': '/customizer/tag',
        'IDPG': '/customizer/idpg'
      };
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        addToCart(JSON.parse(JSON.stringify(designData)));
        
        navigate(customizerPath, { 
          state: { 
            viewMode: true,
            panelData: JSON.parse(JSON.stringify(designData)),
            designId: design.id,
            panelIndex: 0
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        navigate('/panel-type');
      }
    }
  };

  // ➕ Create new revision (copy existing design and start a new version)
  const handleCreateNewRevision = (design: any) => {
    console.log('Creating new revision for design:', design);
    
    const designData = design.designData;
    
    if (design.panelType === 'Project') {
      // For projects, go to the cart page to create a new revision of the whole project
      navigate('/cart', { 
        state: { 
          createNewRevision: true,
          projectData: JSON.parse(JSON.stringify(designData)),
          originalDesignId: design.id,
          originalProjectName: design.projectName
        }
      });
    } else {
      // For individual panels, route to the proper customizer and flag new revision
      const panelTypeToRoute: { [key: string]: string } = {
        'SP': '/customizer/sp',
        'DPH': '/customizer/dph',
        'DPV': '/customizer/dpv',
        'X1H': '/customizer/x1h',
        'X2H': '/customizer/x2h',
        'X2V': '/customizer/x2v',
        'X1V': '/customizer/x1v',
        'TAG': '/customizer/tag',
        'IDPG': '/customizer/idpg'
      };
      
      const customizerPath = panelTypeToRoute[design.panelType];
      
      if (customizerPath) {
        addToCart(JSON.parse(JSON.stringify(designData)));
        
        navigate(customizerPath, { 
          state: { 
            createNewRevision: true,
            panelData: JSON.parse(JSON.stringify(designData)),
            originalDesignId: design.id,
            originalProjectName: design.projectName,
            panelIndex: 0
          }
        });
      } else {
        console.error('Unknown panel type:', design.panelType);
        navigate('/panel-type');
      }
    }
  };
  
  // 📅 Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 📝 Handle form field changes
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectDetails(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (field === 'operator' || field === 'servicePartner') {
      setShowError(false);
    }
  };

  // 📝 Handle help click (toggle between project code and sales manager)
  const handleHelpClick = () => {
    setShowSalesManager(!showSalesManager);
  };

  // 📝 Handle project form submission
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectDetails.operator && !projectDetails.servicePartner) {
      setShowError(true);
      return;
    }
    
    try {
      const result = await mockSendEmail(projectDetails);
      
      if (result.success) {
        console.log('Project details submitted successfully:', result.message);
        
        // Save project details to context and persist
        setProjectName(projectDetails.projectName);
        setProjectCode(projectDetails.projectCode);
        setLocation(projectDetails.location);
        setOperator(projectDetails.operator);
        setServicePartner && setServicePartner(projectDetails.servicePartner);
        try {
          sessionStorage.setItem('ppProjectName', projectDetails.projectName || '');
          sessionStorage.setItem('ppProjectCode', projectDetails.projectCode || '');
          sessionStorage.setItem('ppLocation', projectDetails.location || '');
          sessionStorage.setItem('ppOperator', projectDetails.operator || '');
          sessionStorage.setItem('ppServicePartner', projectDetails.servicePartner || '');
        } catch {}
        
        // Navigate to BOQ first for selecting allowed panel categories
        setAllowedPanelTypes([]);
        navigate('/boq');
      } else {
        console.error('Failed to submit project details:', result.error);
        // Still navigate even if email fails
        setProjectName(projectDetails.projectName);
        setProjectCode(projectDetails.projectCode);
        setLocation(projectDetails.location);
        setOperator(projectDetails.operator);
        setServicePartner && setServicePartner(projectDetails.servicePartner);
        try {
          sessionStorage.setItem('ppProjectName', projectDetails.projectName || '');
          sessionStorage.setItem('ppProjectCode', projectDetails.projectCode || '');
          sessionStorage.setItem('ppLocation', projectDetails.location || '');
          sessionStorage.setItem('ppOperator', projectDetails.operator || '');
          sessionStorage.setItem('ppServicePartner', projectDetails.servicePartner || '');
        } catch {}
        setAllowedPanelTypes([]);
        navigate('/boq');
      }
    } catch (error) {
      console.error('Error submitting project details:', error);
      // Still navigate even if there's an error
      setProjectName(projectDetails.projectName);
      setProjectCode(projectDetails.projectCode);
      setLocation(projectDetails.location);
      setOperator(projectDetails.operator);
      setServicePartner && setServicePartner(projectDetails.servicePartner);
      try {
        sessionStorage.setItem('ppProjectName', projectDetails.projectName || '');
        sessionStorage.setItem('ppProjectCode', projectDetails.projectCode || '');
        sessionStorage.setItem('ppLocation', projectDetails.location || '');
        sessionStorage.setItem('ppOperator', projectDetails.operator || '');
        sessionStorage.setItem('ppServicePartner', projectDetails.servicePartner || '');
      } catch {}
      setAllowedPanelTypes([]);
      navigate('/boq');
    }
  };
  
  // 🎨 Render the page
  return (
    <PageContainer>
      {/* 📋 HEADER */}
      <HeaderContainer>
        <IconButton 
          onClick={() => navigate('/')} 
          sx={{ color: 'white' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          📚 My Designs
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowProjectForm(true)}
          sx={{ 
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)'
            }
          }}
        >
          Create New Design
        </Button>
      </HeaderContainer>
      
      {/* ⚠️ ERROR MESSAGE */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* 🔄 LOADING SPINNER */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      ) : (
        /* 📋 HIERARCHICAL DESIGNS VIEW */
        <Box>
          {Object.keys(organizedDesigns).length === 0 ? (
            // 📭 EMPTY STATE
            <Card sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    📭 No designs yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                  Create your first design to see it organized by location, operator, and project!
                  </Typography>
                </CardContent>
              </Card>
          ) : (
            // 🗂️ HIERARCHICAL ORGANIZATION
            Object.entries(organizedDesigns).map(([location, operators]: [string, any]) => (
              <LocationAccordion key={location}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ color: '#3498db' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {location}
                    </Typography>
                    <Chip 
                      label={Object.keys(operators).length} 
                      size="small" 
                      color="primary"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {Object.entries(operators).map(([operator, projects]: [string, any]) => (
                    <OperatorAccordion key={operator}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ color: '#27ae60' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {operator}
                          </Typography>
                          <Chip 
                            label={Object.keys(projects).length} 
                            size="small" 
                            color="success"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {Object.entries(projects).map(([projectKey, projectData]: [string, any]) => (
                          <ProjectAccordion key={projectKey}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FolderIcon sx={{ color: '#e67e22' }} />
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {projectData.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Code: {projectData.code}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={Object.keys(projectData.revisions).length} 
                                  size="small" 
                                  color="warning"
                                  sx={{ marginLeft: 'auto' }}
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              {Object.entries(projectData.revisions).map(([revisionKey, revisionData]: [string, any]) => (
                                <RevisionCard key={revisionKey}>
                                  <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e67e22' }}>
                                        Revision {revisionData.revision}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        ({revisionData.designs.length} design{revisionData.designs.length !== 1 ? 's' : ''})
                                      </Typography>
                                    </Box>
                                    
                                    <List dense>
                                      {revisionData.designs.map((design: any) => (
                                  <ListItem key={design.id} sx={{ px: 0 }}>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {design.projectName}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" color="text.secondary">
                      Modified: {formatDate(design.lastModified)}
                    </Typography>
                                      }
                                    />
                                    <ListItemSecondaryAction>
                                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCreateNewRevision(design)}
                                          sx={{ color: '#e67e22' }}
                                          title="Create New Revision"
                                        >
                                          <AddIcon />
                                        </IconButton>
                                        <IconButton
                      size="small"
                      onClick={() => handleViewDesign(design)}
                                          sx={{ color: '#3498db' }}
                                          title="View Design"
                                        >
                                          <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                      size="small"
                      onClick={() => handleEditDesign(design)}
                                          sx={{ color: '#27ae60' }}
                                          title="Edit Design"
                                        >
                                          <EditIcon />
                                        </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDesign(design.id)}
                                          sx={{ color: '#e74c3c' }}
                                          title="Delete Design"
                    >
                      <DeleteIcon />
                    </IconButton>
                                      </Box>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            </CardContent>
                          </RevisionCard>
                        ))}
                      </AccordionDetails>
                    </ProjectAccordion>
                        ))}
                      </AccordionDetails>
                    </OperatorAccordion>
                  ))}
                </AccordionDetails>
              </LocationAccordion>
            ))
          )}
        </Box>
      )}
      
      {/* 📋 PROJECT FORM MODAL */}
      {showProjectForm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 2
          }}
        >
          <Paper
            sx={{
              maxWidth: '600px',
              width: '100%',
              padding: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              animation: 'slideIn 0.5s ease-out',
              '@keyframes slideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px) scale(0.95)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                }
              }
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: '1.8rem',
                fontWeight: 600,
                color: '#2c3e50',
                marginBottom: 3,
                textAlign: 'center',
                fontFamily: 'sans-serif'
              }}
            >
              Project Details
            </Typography>
            
            <form onSubmit={handleProjectSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Project Name and Location */}
                <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <TextField
                    label="Project Name"
                    variant="outlined"
                    value={projectDetails.projectName}
                    onChange={handleChange('projectName')}
                    required
                    sx={{ flex: 1, minWidth: '250px' }}
                  />
                  <TextField
                    label="Location"
                    variant="outlined"
                    value={projectDetails.location}
                    onChange={handleChange('location')}
                    required
                    sx={{ flex: 1, minWidth: '250px' }}
                  />
                </Box>
                
                {/* Project Code or Sales Manager */}
                <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {!showSalesManager ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <TextField
                        label="Project Code"
                        variant="outlined"
                        value={projectDetails.projectCode}
                        onChange={handleChange('projectCode')}
                        required
                      />
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          color: '#3498db',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textAlign: 'center',
                          '&:hover': { color: '#2980b9' }
                        }}
                        onClick={handleHelpClick}
                      >
                        Don't know the project code?
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <TextField
                        label="INTEREL Sales Manager"
                        variant="outlined"
                        value={projectDetails.salesManager}
                        onChange={handleChange('salesManager')}
                        required
                      />
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          color: '#3498db',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textAlign: 'center',
                          '&:hover': { color: '#2980b9' }
                        }}
                        onClick={handleHelpClick}
                      >
                        I have the project code
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Operator and Service Partner */}
                <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <TextField
                    label="Operator"
                    variant="outlined"
                    value={projectDetails.operator}
                    onChange={handleChange('operator')}
                    placeholder="Enter operator name"
                    sx={{ flex: 1, minWidth: '250px' }}
                  />
                  <TextField
                    label="Service Partner"
                    variant="outlined"
                    value={projectDetails.servicePartner}
                    onChange={handleChange('servicePartner')}
                    placeholder="Enter service partner name"
                    sx={{ flex: 1, minWidth: '250px' }}
                  />
                </Box>
                
                {/* Error Message */}
                {showError && (
                  <Typography
                    sx={{
                      color: '#e74c3c',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      fontFamily: 'sans-serif'
                    }}
                  >
                    Please provide either an Operator or Service Partner.
                  </Typography>
                )}
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowProjectForm(false)}
                    sx={{
                      fontFamily: 'sans-serif',
                      fontWeight: 500,
                      padding: '0.8rem 2rem'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      fontFamily: 'sans-serif',
                      fontWeight: 600,
                      padding: '0.8rem 2rem',
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)'
                      }
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      )}
    </PageContainer>
  );
};

export default MyDesigns; 