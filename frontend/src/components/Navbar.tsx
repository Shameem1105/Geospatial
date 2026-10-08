import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icons';
import { Button } from './Button';

interface NavbarProps {
  title?: string;
  onToggleMenu?: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Geospatial Dashboard',
  '/upload': 'Upload & Run Dataset',
  '/processing': 'Processing Dataset',
  '/analysis': 'Spatial Analysis Map',
  '/explorer': 'Feature & Map Explorer',
};

export const Navbar: React.FC<NavbarProps> = ({ title, onToggleMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    if (title) return title;
    const match = Object.keys(pageTitles).find((path) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    );
    return match ? pageTitles[match] : 'Dashboard';
  };

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onToggleMenu} aria-label="Toggle navigation menu">
        <Icon name="grid" />
      </button>

      <div className="breadcrumb">
        <span>TerraFlow</span>
        <Icon name="arrow" size={13} />
        <strong>{getTitle()}</strong>
      </div>

      <div className="header-actions">
        {location.pathname !== '/upload' && (
          <Button
            icon="cloud"
            onClick={() => navigate('/upload')}
          >
            Upload File
          </Button>
        )}
      </div>
    </header>
  );
};

export const Header = Navbar;
