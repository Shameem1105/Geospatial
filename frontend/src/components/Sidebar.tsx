import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icons';
import { Logo } from './Logo';

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/upload', label: 'Upload & Run', icon: 'cloud' },
  { path: '/analysis', label: 'Spatial Map View', icon: 'layers' },
];

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Logo />
      <div className="nav-label">NAVIGATION</div>
      <nav>
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {isActive && <span className="active-dot" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="api-status">
          <span className="pulse" />
          <div>
            <strong>API Operational</strong>
            <small>FastAPI Backend Ready</small>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
