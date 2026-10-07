import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from './Icons';

interface NavbarProps {
  title?: string;
  onToggleMenu?: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Geospatial Operations',
  '/upload': 'Import Geospatial Dataset',
  '/processing': 'Processing Dataset',
  '/analysis': 'Chennai Site Survey',
  '/explorer': 'Feature Explorer',
  '/analytics': 'Engineering Analytics',
  '/reports': 'Measurement Reports',
  '/projects': 'Projects',
  '/files': 'Survey Files',
  '/settings': 'Settings',
};

export const Navbar: React.FC<NavbarProps> = ({ title, onToggleMenu }) => {
  const location = useLocation();

  const getTitle = () => {
    if (title) return title;
    const match = Object.keys(pageTitles).find((path) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    );
    return match ? pageTitles[match] : 'Overview';
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
        <div className="search">
          <Icon name="search" />
          <span>Search datasets, projects...</span>
          <kbd>⌘ K</kbd>
        </div>

        <button className="icon-button" aria-label="Notifications">
          <Icon name="bell" />
          <span className="notification" />
        </button>

        <button className="workspace-switcher" aria-label="Switch workspace">
          <span className="workspace-icon">HC</span>
          <span>Horizon Civil</span>
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </header>
  );
};

export const Header = Navbar;
